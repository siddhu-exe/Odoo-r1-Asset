import uuid
from datetime import date, datetime

from app.core.enums import AuditItemStatus, AuditStatus
from app.shared.base_schema import BaseSchema


class AuditCycleResponse(BaseSchema):
    id: uuid.UUID
    name: str
    scope_department_id: uuid.UUID | None
    scope_location: str | None
    start_date: date
    end_date: date
    status: AuditStatus
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime


class CreateAuditCycleRequest(BaseSchema):
    name: str
    scope_department_id: uuid.UUID | None = None
    scope_location: str | None = None
    start_date: date
    end_date: date


class AssignAuditorRequest(BaseSchema):
    auditor_id: uuid.UUID


class AuditItemResponse(BaseSchema):
    id: uuid.UUID
    cycle_id: uuid.UUID
    asset_id: uuid.UUID
    auditor_id: uuid.UUID | None
    status: AuditItemStatus
    notes: str | None
    verified_at: datetime | None


class UpdateAuditItemRequest(BaseSchema):
    status: AuditItemStatus
    notes: str | None = None


class DiscrepancyReportResponse(BaseSchema):
    cycle_id: uuid.UUID
    total_assets: int
    verified: int
    missing: int
    damaged: int
    pending: int
