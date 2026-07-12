from collections.abc import AsyncGenerator
from datetime import datetime, timezone
import sqlite3

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings


engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.ENVIRONMENT == "development",
)


@event.listens_for(engine.sync_engine, "connect")
def register_sqlite_now(dbapi_connection, connection_record) -> None:
    try:
        dbapi_connection.create_function("now", 0, lambda: datetime.now(timezone.utc).isoformat())
    except Exception:
        pass
    try:
        raw_conn = getattr(dbapi_connection, "_conn", None)
        if raw_conn is not None:
            raw_conn.create_function("now", 0, lambda: datetime.now(timezone.utc).isoformat())
    except Exception:
        pass

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
