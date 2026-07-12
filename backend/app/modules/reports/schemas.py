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
