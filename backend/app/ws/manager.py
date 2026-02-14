import uuid
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # group_id -> {user_id -> WebSocket}
        self.rooms: dict[uuid.UUID, dict[uuid.UUID, WebSocket]] = {}
        # user_id -> set of group_ids
        self.user_groups: dict[uuid.UUID, set[uuid.UUID]] = {}
        # user_id -> WebSocket
        self.active_users: dict[uuid.UUID, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: uuid.UUID):
        await websocket.accept()
        self.active_users[user_id] = websocket
        self.user_groups[user_id] = set()

    def disconnect(self, user_id: uuid.UUID):
        for group_id in self.user_groups.get(user_id, set()):
            if group_id in self.rooms:
                self.rooms[group_id].pop(user_id, None)
                if not self.rooms[group_id]:
                    del self.rooms[group_id]
        self.user_groups.pop(user_id, None)
        self.active_users.pop(user_id, None)

    def join_room(self, user_id: uuid.UUID, group_id: uuid.UUID):
        if group_id not in self.rooms:
            self.rooms[group_id] = {}
        ws = self.active_users.get(user_id)
        if ws:
            self.rooms[group_id][user_id] = ws
            self.user_groups[user_id].add(group_id)

    async def broadcast_to_room(
        self,
        group_id: uuid.UUID,
        message: dict[str, Any],
        exclude_user: uuid.UUID | None = None,
    ):
        if group_id not in self.rooms:
            return
        disconnected = []
        for uid, ws in self.rooms[group_id].items():
            if uid == exclude_user:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(uid)
        for uid in disconnected:
            self.disconnect(uid)

    async def broadcast_to_all(self, message: dict[str, Any], exclude_user: uuid.UUID | None = None):
        disconnected = []
        for uid, ws in self.active_users.items():
            if uid == exclude_user:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(uid)
        for uid in disconnected:
            self.disconnect(uid)

    def get_online_user_ids(self) -> list[str]:
        return [str(uid) for uid in self.active_users.keys()]


manager = ConnectionManager()
