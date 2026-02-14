import os
import uuid
import aiofiles
from fastapi import UploadFile

from app.config import settings


async def save_upload_file(file: UploadFile) -> tuple[str, int, str]:
    """Save uploaded file and return (stored_filename, file_size, mime_type)."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1]
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    file_size = 0
    async with aiofiles.open(file_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            file_size += len(chunk)
            if file_size > settings.MAX_FILE_SIZE:
                os.remove(file_path)
                raise ValueError(
                    f"File too large. Max size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
                )
            await f.write(chunk)

    mime_type = file.content_type or "application/octet-stream"
    return stored_filename, file_size, mime_type


def get_file_path(stored_filename: str) -> str:
    return os.path.join(settings.UPLOAD_DIR, stored_filename)
