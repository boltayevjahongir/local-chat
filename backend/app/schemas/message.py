import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserResponse


class FileAttachmentResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    file_size: int
    mime_type: str

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: uuid.UUID
    group_id: uuid.UUID
    sender_id: uuid.UUID | None
    sender: UserResponse | None = None
    content: str | None
    message_type: str
    created_at: datetime
    file_attachment: FileAttachmentResponse | None = None

    model_config = {"from_attributes": True}
