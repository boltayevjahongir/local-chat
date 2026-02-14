import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.group_member import GroupMember
from app.schemas.message import MessageResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/{group_id}", response_model=list[MessageResponse])
async def get_messages(
    group_id: uuid.UUID,
    before: datetime | None = Query(None),
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check membership
    membership = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member")

    query = (
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.file_attachment),
        )
        .where(Message.group_id == group_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )

    if before:
        query = query.where(Message.created_at < before)

    result = await db.execute(query)
    messages = result.scalars().all()
    return list(reversed(messages))
