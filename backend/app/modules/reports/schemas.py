import uuid
from datetime import date

from app.shared.base_schema import BaseSchema


class DashboardKpiResponse(BaseSchema):
    assets_available: int
    assets_allocated: int
    assets_under_maintenance: int
    active_bookings: int
    overdue_allocations: int
    pending_maintenance_requests: int
    pending_transfers: int


class AssetUtilizationResponse(BaseSchema):
    total_assets: int
    allocated: int
    available: int
    under_maintenance: int
    utilization_rate: float


class MaintenanceFrequencyItem(BaseSchema):
    asset_id: str
    asset_name: str
    asset_tag: str
    maintenance_count: int


class DepartmentAllocationItem(BaseSchema):
    department_id: str
    department_name: str
    total_allocations: int


class BookingHeatmapItem(BaseSchema):
    hour: int
    booking_count: int


class MostUsedAssetItem(BaseSchema):
    asset_id: uuid.UUID
    name: str
    asset_tag: str
    usage_count: int
    description: str


class IdleAssetItem(BaseSchema):
    asset_id: uuid.UUID
    name: str
    asset_tag: str
    days_idle: int
    description: str


class MaintenanceDueItem(BaseSchema):
    asset_id: uuid.UUID
    name: str
    asset_tag: str
    next_maintenance_date: date
    days_remaining: int
    description: str


class NearingRetirementItem(BaseSchema):
    asset_id: uuid.UUID
    name: str
    asset_tag: str
    age_years: float
    expected_lifespan_years: int
    description: str


class MaintenanceAndRetirementResponse(BaseSchema):
    due_for_maintenance: list[MaintenanceDueItem]
    nearing_retirement: list[NearingRetirementItem]


class ReportsSummaryResponse(BaseSchema):
    utilization: AssetUtilizationResponse
    departments: list[DepartmentAllocationItem]
    maintenance_frequency: list[MaintenanceFrequencyItem]
    most_used: list[MostUsedAssetItem]
    idle: list[IdleAssetItem]
    maintenance_retirement: MaintenanceAndRetirementResponse
