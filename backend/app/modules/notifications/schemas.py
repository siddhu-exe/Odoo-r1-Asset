import uuid
from datetime import datetime

from app.core.enums import NotificationType
from app.shared.base_schema import BaseSchema


class NotificationResponse(BaseSchema):
    id: uuid.UUID
    employee_id: uuid.UUID
    type: NotificationType
    title: str
    message: str
    is_read: bool
    entity_type: str | None
    entity_id: uuid.UUID | None
    created_at: datetime


class ActivityLogResponse(BaseSchema):
    id: uuid.UUID
    employee_id: uuid.UUID | None
    action: str
    entity_type: str
    entity_id: uuid.UUID | None
    details: dict | None
    created_at: datetime
