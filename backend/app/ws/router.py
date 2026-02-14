import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from jose import JWTError

from app.database import AsyncSessionLocal
from app.utils.security import decode_access_token
from app.models.user import User
from app.models.group_member import GroupMember
from app.models.message import Message
from app.models.file_attachment import FileAttachment
from app.ws.manager import manager

router = APIRouter()


async def authenticate_ws(websocket: WebSocket) -> uuid.UUID | None:
    token = websocket.query_params.get("token")
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        return uuid.UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    user_id = await authenticate_ws(websocket)
    if user_id is None:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await manager.connect(websocket, user_id)

    # Mark user online and join all their groups
    async with AsyncSessionLocal() as db:
        user = await db.get(User, user_id)
        if user:
            user.is_online = True
            await db.commit()

        result = await db.execute(
            select(GroupMember.group_id).where(GroupMember.user_id == user_id)
        )
        group_ids = [row[0] for row in result.all()]
        for gid in group_ids:
            manager.join_room(user_id, gid)

    # Broadcast online status
    await manager.broadcast_to_all(
        {"type": "user_status", "user_id": str(user_id), "is_online": True},
        exclude_user=user_id,
    )

    try:
        while True:
            data = await websocket.receive_json()
            await handle_ws_message(user_id, data)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        manager.disconnect(user_id)
        async with AsyncSessionLocal() as db:
            user = await db.get(User, user_id)
            if user:
                user.is_online = False
                user.last_seen = datetime.now(timezone.utc)
                await db.commit()
        await manager.broadcast_to_all(
            {"type": "user_status", "user_id": str(user_id), "is_online": False},
        )


async def handle_ws_message(sender_id: uuid.UUID, data: dict):
    msg_type = data.get("type")

    if msg_type == "chat_message":
        group_id = uuid.UUID(data["group_id"])
        content = data.get("content")
        message_type = data.get("message_type", "text")
        file_attachment_id = data.get("file_attachment_id")

        async with AsyncSessionLocal() as db:
            msg = Message(
                group_id=group_id,
                sender_id=sender_id,
                content=content,
                message_type=message_type,
            )
            db.add(msg)
            await db.flush()

            attachment_data = None
            if file_attachment_id:
                attachment = await db.get(FileAttachment, uuid.UUID(file_attachment_id))
                if attachment:
                    attachment.message_id = msg.id
                    attachment_data = {
                        "id": str(attachment.id),
                        "original_filename": attachment.original_filename,
                        "file_size": attachment.file_size,
                        "mime_type": attachment.mime_type,
                    }

            await db.commit()

            # Get sender info
            sender = await db.get(User, sender_id)
            sender_data = None
            if sender:
                sender_data = {
                    "id": str(sender.id),
                    "username": sender.username,
                    "display_name": sender.display_name,
                    "avatar_color": sender.avatar_color,
                }

            broadcast = {
                "type": "chat_message",
                "id": str(msg.id),
                "group_id": str(group_id),
                "sender_id": str(sender_id),
                "sender": sender_data,
                "content": content,
                "message_type": message_type,
                "created_at": msg.created_at.isoformat(),
                "file_attachment": attachment_data,
            }

        await manager.broadcast_to_room(group_id, broadcast)

    elif msg_type == "typing":
        group_id = uuid.UUID(data["group_id"])
        await manager.broadcast_to_room(
            group_id,
            {
                "type": "typing",
                "group_id": str(group_id),
                "user_id": str(sender_id),
                "is_typing": data.get("is_typing", True),
            },
            exclude_user=sender_id,
        )

    elif msg_type == "join_room":
        group_id = uuid.UUID(data["group_id"])
        manager.join_room(sender_id, group_id)
