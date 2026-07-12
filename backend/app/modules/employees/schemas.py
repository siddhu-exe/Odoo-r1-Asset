import uuid
from datetime import datetime

from app.core.enums import EntityStatus, UserRole
from app.shared.base_schema import BaseSchema


class EmployeeResponse(BaseSchema):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    phone: str | None
    role: UserRole
    status: EntityStatus
    department_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class CreateEmployeeRequest(BaseSchema):
    email: str
    password: str
    first_name: str
    last_name: str
    phone: str | None = None
    department_id: uuid.UUID | None = None


class UpdateEmployeeRequest(BaseSchema):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    department_id: uuid.UUID | None = None


class UpdateRoleRequest(BaseSchema):
    role: UserRole


class UpdateStatusRequest(BaseSchema):
    status: EntityStatus
