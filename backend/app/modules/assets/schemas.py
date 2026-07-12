import uuid
from datetime import date, datetime
from decimal import Decimal

from app.core.enums import AllocationStatus, AssetCondition, AssetStatus, MaintenanceStatus
from app.shared.base_schema import BaseSchema


class AssetResponse(BaseSchema):
    id: uuid.UUID
    name: str
    asset_tag: str
    serial_number: str | None
    category_id: uuid.UUID
    category_name: str | None
    condition: AssetCondition
    status: AssetStatus
    location: str | None
    is_bookable: bool
    acquisition_date: date | None
    acquisition_cost: Decimal | None
    photo_url: str | None
    document_url: str | None
    notes: str | None
    next_maintenance_date: date | None
    expected_lifespan_years: int | None
    created_at: datetime
    updated_at: datetime


class CreateAssetRequest(BaseSchema):
    name: str
    serial_number: str | None = None
    category_id: uuid.UUID
    condition: AssetCondition = AssetCondition.GOOD
    location: str | None = None
    is_bookable: bool = False
    acquisition_date: date | None = None
    acquisition_cost: Decimal | None = None
    photo_url: str | None = None
    document_url: str | None = None
    notes: str | None = None
    next_maintenance_date: date | None = None
    expected_lifespan_years: int | None = None


class UpdateAssetRequest(BaseSchema):
    name: str | None = None
    condition: AssetCondition | None = None
    location: str | None = None
    is_bookable: bool | None = None
    notes: str | None = None
    photo_url: str | None = None
    document_url: str | None = None
    next_maintenance_date: date | None = None
    expected_lifespan_years: int | None = None


class AllocationHistoryEntry(BaseSchema):
    id: uuid.UUID
    status: AllocationStatus
    allocated_at: datetime
    returned_at: datetime | None


class MaintenanceHistoryEntry(BaseSchema):
    id: uuid.UUID
    status: MaintenanceStatus
    priority: str
    description: str | None
    raised_at: datetime


class AssetHistoryResponse(BaseSchema):
    allocations: list[AllocationHistoryEntry]
    maintenance_requests: list[MaintenanceHistoryEntry]
