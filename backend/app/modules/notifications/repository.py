import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import ActivityLog, Notification
from app.shared.base_repository import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_for_employee(self, employee_id: uuid.UUID) -> list[Notification]:
        result = await self.session.execute(
            select(Notification)
            .where(Notification.employee_id == employee_id)
            .order_by(Notification.created_at.desc())
            .limit(50)
        )
        return list(result.scalars().all())

    async def mark_all_read(self, employee_id: uuid.UUID) -> None:
        from sqlalchemy import update

        await self.session.execute(
            update(Notification)
            .where(
                Notification.employee_id == employee_id,
                Notification.is_read.is_(False),
            )
            .values(is_read=True)
        )


class ActivityLogRepository(BaseRepository[ActivityLog]):
    model = ActivityLog

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
