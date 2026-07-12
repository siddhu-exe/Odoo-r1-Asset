from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.enums import EntityStatus, UserRole
from app.core.security import hash_password
from app.modules.employees.models import Employee


# Runs once on startup; creates the default admin if no admin account exists yet.
async def seed_admin(session: AsyncSession) -> None:
    result = await session.execute(
        select(Employee).where(Employee.role == UserRole.ADMIN)
    )
    if result.scalar_one_or_none() is not None:
        return

    admin = Employee(
        email=settings.ADMIN_EMAIL,
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        first_name=settings.ADMIN_FIRST_NAME,
        last_name=settings.ADMIN_LAST_NAME,
        role=UserRole.ADMIN,
        status=EntityStatus.ACTIVE,
    )
    session.add(admin)
    await session.commit()
