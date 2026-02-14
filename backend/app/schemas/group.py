import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class CreateGroupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    member_ids: list[uuid.UUID] = []


class AddMembersRequest(BaseModel):
    user_ids: list[uuid.UUID]


class GroupResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    is_global: bool
    created_by: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupDetailResponse(GroupResponse):
    members: list[UserResponse] = []
