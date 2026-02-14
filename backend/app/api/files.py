import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.file_attachment import FileAttachment
from app.schemas.message import FileAttachmentResponse
from app.utils.file_utils import save_upload_file, get_file_path
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/upload", response_model=FileAttachmentResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        stored_filename, file_size, mime_type = await save_upload_file(file)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(e))

    attachment = FileAttachment(
        original_filename=file.filename or "unnamed",
        stored_filename=stored_filename,
        file_size=file_size,
        mime_type=mime_type,
    )
    db.add(attachment)
    await db.flush()

    return attachment


@router.get("/{file_id}")
async def download_file(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FileAttachment).where(FileAttachment.id == file_id)
    )
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_path = get_file_path(attachment.stored_filename)
    return FileResponse(
        path=file_path,
        filename=attachment.original_filename,
        media_type=attachment.mime_type,
    )
