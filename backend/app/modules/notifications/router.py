import uuid
from typing import Annotated

from fastapi import APIRouter

from app.core.enums import UserRole
from app.modules.notifications import service
from app.modules.notifications.schemas import ActivityLogResponse, NotificationResponse
from app.shared.dependencies import CurrentEmployeeId, SessionDep, require_role


router = APIRouter()

AdminOnly = require_role(UserRole.ADMIN)


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> list[NotificationResponse]:
    return await service.list_notifications(current_employee_id, session)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: uuid.UUID,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> NotificationResponse:
    return await service.mark_notification_read(notification_id, current_employee_id, session)


@router.patch("/read-all", status_code=204)
async def mark_all_notifications_read(
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> None:
    await service.mark_all_notifications_read(current_employee_id, session)


@router.get("/activity-logs", response_model=list[ActivityLogResponse])
async def list_activity_logs(
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> list[ActivityLogResponse]:
    return await service.list_activity_logs(session)
