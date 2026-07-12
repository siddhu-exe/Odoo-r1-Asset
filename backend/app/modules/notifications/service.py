import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import NotificationType
from app.modules.notifications.models import ActivityLog, Notification
from app.modules.notifications.repository import ActivityLogRepository, NotificationRepository


async def dispatch_notification(
    employee_id: uuid.UUID,
    notification_type: NotificationType,
    title: str,
    message: str,
    session: AsyncSession,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
) -> None:
    notification = Notification(
        employee_id=employee_id,
        type=notification_type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
        is_read=False,
    )
    session.add(notification)
    await session.flush()


async def record_activity(
    action: str,
    entity_type: str,
    session: AsyncSession,
    employee_id: uuid.UUID | None = None,
    entity_id: uuid.UUID | None = None,
    details: dict | None = None,
) -> None:
    log = ActivityLog(
        employee_id=employee_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )
    session.add(log)
    await session.flush()


async def list_notifications(
    employee_id: uuid.UUID,
    session: AsyncSession,
) -> list[Notification]:
    repository = NotificationRepository(session)
    return await repository.list_for_employee(employee_id)


async def mark_notification_read(
    notification_id: uuid.UUID,
    employee_id: uuid.UUID,
    session: AsyncSession,
) -> Notification:
    repository = NotificationRepository(session)
    notification = await repository.get_by_id_or_raise(notification_id)
    notification.is_read = True

    await session.flush()
    await session.refresh(notification)
    return notification


async def mark_all_notifications_read(
    employee_id: uuid.UUID,
    session: AsyncSession,
) -> None:
    repository = NotificationRepository(session)
    await repository.mark_all_read(employee_id)


async def list_activity_logs(
    session: AsyncSession,
    offset: int = 0,
    limit: int = 50,
) -> list[ActivityLog]:
    repository = ActivityLogRepository(session)
    return await repository.list_all(offset=offset, limit=limit)
