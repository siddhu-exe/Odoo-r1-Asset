import uuid
from datetime import datetime

from app.core.enums import MaintenancePriority, MaintenanceStatus
from app.shared.base_schema import BaseSchema


class MaintenanceRequestResponse(BaseSchema):
    id: uuid.UUID
    asset_id: uuid.UUID
    raised_by: uuid.UUID
    description: str
    priority: MaintenancePriority
    status: MaintenanceStatus
    technician_id: uuid.UUID | None
    approved_by: uuid.UUID | None
    photo_url: str | None
    resolved_at: datetime | None
    resolution_notes: str | None
    created_at: datetime
    updated_at: datetime


class CreateMaintenanceRequest(BaseSchema):
    asset_id: uuid.UUID
    description: str
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    photo_url: str | None = None


class AssignTechnicianRequest(BaseSchema):
    technician_id: uuid.UUID


class ResolveRequest(BaseSchema):
    resolution_notes: str
