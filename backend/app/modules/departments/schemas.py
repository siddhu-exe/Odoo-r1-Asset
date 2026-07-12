import uuid
from datetime import datetime

from app.core.enums import EntityStatus
from app.shared.base_schema import BaseSchema


class DepartmentResponse(BaseSchema):
    id: uuid.UUID
    name: str
    code: str
    description: str | None
    status: EntityStatus
    parent_id: uuid.UUID | None
    head_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class CreateDepartmentRequest(BaseSchema):
    name: str
    code: str
    description: str | None = None
    parent_id: uuid.UUID | None = None
    head_id: uuid.UUID | None = None


class UpdateDepartmentRequest(BaseSchema):
    name: str | None = None
    description: str | None = None
    parent_id: uuid.UUID | None = None
    head_id: uuid.UUID | None = None


class UpdateStatusRequest(BaseSchema):
    status: EntityStatus
