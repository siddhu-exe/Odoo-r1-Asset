from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import AllocationStatus, AssetStatus, BookingStatus, MaintenanceStatus, TransferStatus
from app.modules.allocations.models import Allocation, TransferRequest
from app.modules.assets.models import Asset
from app.modules.bookings.models import Booking
from app.modules.departments.models import Department
from app.modules.maintenance.models import MaintenanceRequest
from app.modules.reports.schemas import (
    AssetUtilizationResponse,
    BookingHeatmapItem,
    DashboardKpiResponse,
    DepartmentAllocationItem,
    MaintenanceFrequencyItem,
)


async def get_dashboard_kpis(session: AsyncSession) -> DashboardKpiResponse:
    assets_available = await session.scalar(
        select(func.count(Asset.id)).where(Asset.status == AssetStatus.AVAILABLE)
    ) or 0

    assets_allocated = await session.scalar(
        select(func.count(Asset.id)).where(Asset.status == AssetStatus.ALLOCATED)
    ) or 0

    assets_under_maintenance = await session.scalar(
        select(func.count(Asset.id)).where(Asset.status == AssetStatus.UNDER_MAINTENANCE)
    ) or 0

    active_bookings = await session.scalar(
        select(func.count(Booking.id)).where(
            Booking.status.in_([BookingStatus.UPCOMING, BookingStatus.ONGOING])
        )
    ) or 0

    overdue_allocations = await session.scalar(
        select(func.count(Allocation.id)).where(
            Allocation.status == AllocationStatus.ACTIVE,
            Allocation.expected_return_date < date.today(),
        )
    ) or 0

    pending_maintenance = await session.scalar(
        select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.status == MaintenanceStatus.PENDING
        )
    ) or 0

    pending_transfers = await session.scalar(
        select(func.count(TransferRequest.id)).where(
            TransferRequest.status == TransferStatus.PENDING
        )
    ) or 0

    return DashboardKpiResponse(
        assets_available=assets_available,
        assets_allocated=assets_allocated,
        assets_under_maintenance=assets_under_maintenance,
        active_bookings=active_bookings,
        overdue_allocations=overdue_allocations,
        pending_maintenance_requests=pending_maintenance,
        pending_transfers=pending_transfers,
    )


async def get_asset_utilization(session: AsyncSession) -> AssetUtilizationResponse:
    total = await session.scalar(select(func.count(Asset.id))) or 0
    allocated = await session.scalar(
        select(func.count(Asset.id)).where(Asset.status == AssetStatus.ALLOCATED)
    ) or 0
    available = await session.scalar(
        select(func.count(Asset.id)).where(Asset.status == AssetStatus.AVAILABLE)
    ) or 0
    under_maintenance = await session.scalar(
        select(func.count(Asset.id)).where(Asset.status == AssetStatus.UNDER_MAINTENANCE)
    ) or 0

    utilization_rate = round(allocated / total, 4) if total > 0 else 0.0

    return AssetUtilizationResponse(
        total_assets=total,
        allocated=allocated,
        available=available,
        under_maintenance=under_maintenance,
        utilization_rate=utilization_rate,
    )


async def get_maintenance_frequency(
    session: AsyncSession,
    limit: int = 10,
) -> list[MaintenanceFrequencyItem]:
    result = await session.execute(
        select(
            Asset.id,
            Asset.name,
            Asset.asset_tag,
            func.count(MaintenanceRequest.id).label("maintenance_count"),
        )
        .join(MaintenanceRequest, MaintenanceRequest.asset_id == Asset.id)
        .group_by(Asset.id, Asset.name, Asset.asset_tag)
        .order_by(func.count(MaintenanceRequest.id).desc())
        .limit(limit)
    )
    return [
        MaintenanceFrequencyItem(
            asset_id=str(row.id),
            asset_name=row.name,
            asset_tag=row.asset_tag,
            maintenance_count=row.maintenance_count,
        )
        for row in result.fetchall()
    ]


async def get_department_allocation_summary(
    session: AsyncSession,
) -> list[DepartmentAllocationItem]:
    result = await session.execute(
        select(
            Department.id,
            Department.name,
            func.count(Allocation.id).label("total_allocations"),
        )
        .join(Allocation, Allocation.department_id == Department.id)
        .where(Allocation.status == AllocationStatus.ACTIVE)
        .group_by(Department.id, Department.name)
        .order_by(func.count(Allocation.id).desc())
    )
    return [
        DepartmentAllocationItem(
            department_id=str(row.id),
            department_name=row.name,
            total_allocations=row.total_allocations,
        )
        for row in result.fetchall()
    ]


async def get_booking_heatmap(session: AsyncSession) -> list[BookingHeatmapItem]:
    result = await session.execute(
        select(
            func.extract("hour", Booking.start_time).label("hour"),
            func.count(Booking.id).label("booking_count"),
        )
        .where(Booking.status != BookingStatus.CANCELLED)
        .group_by(func.extract("hour", Booking.start_time))
        .order_by(func.extract("hour", Booking.start_time))
    )
    return [
        BookingHeatmapItem(hour=int(row.hour), booking_count=row.booking_count)
        for row in result.fetchall()
    ]
