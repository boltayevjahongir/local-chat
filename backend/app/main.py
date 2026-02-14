from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.database import engine, AsyncSessionLocal
from app.models.group import Group
from app.api import auth, users, groups, messages, files
from app.ws.router import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed global "General" group if it doesn't exist
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Group).where(Group.is_global == True))
        if not result.scalar_one_or_none():
            global_group = Group(
                name="General",
                description="Umumiy chat — barcha foydalanuvchilar uchun",
                is_global=True,
            )
            db.add(global_group)
            await db.commit()
    yield
    await engine.dispose()


app = FastAPI(title="LAN Chat", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(ws_router)
