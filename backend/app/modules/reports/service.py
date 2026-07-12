import csv
import io
import uuid
from datetime import date, datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.reports.repository import ReportsRepository
from app.modules.reports.schemas import (
    AssetUtilizationResponse,
    BookingHeatmapItem,
    DashboardKpiResponse,
    DepartmentAllocationItem,
    IdleAssetItem,
    MaintenanceAndRetirementResponse,
    MaintenanceDueItem,
    MaintenanceFrequencyItem,
    MostUsedAssetItem,
    NearingRetirementItem,
    ReportsSummaryResponse,
)


def _calculate_days_idle(dt_val) -> int:
    if dt_val is None:
        return 0
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val.replace("Z", "+00:00"))
        except ValueError:
            try:
                dt_val = date.fromisoformat(dt_val)
            except ValueError:
                return 0
    current_dt = datetime.now(timezone.utc)
    if isinstance(dt_val, datetime):
        if dt_val.tzinfo is None:
            dt_val = dt_val.replace(tzinfo=timezone.utc)
        delta = current_dt - dt_val
    elif isinstance(dt_val, date):
        delta = date.today() - dt_val
    else:
        return 0
    return max(0, delta.days)


async def get_dashboard_kpis(session: AsyncSession) -> DashboardKpiResponse:
    repo = ReportsRepository(session)
    available = await repo.get_assets_count_by_status("available")
    allocated = await repo.get_assets_count_by_status("allocated")
    maintenance = await repo.get_assets_count_by_status("under_maintenance")
    active_bookings = await repo.get_active_bookings_count()
    overdue = await repo.get_overdue_allocations_count()
    pending_maint = await repo.get_pending_maintenance_count()
    pending_trans = await repo.get_pending_transfers_count()
    return DashboardKpiResponse(
        assets_available=available,
        assets_allocated=allocated,
        assets_under_maintenance=maintenance,
        active_bookings=active_bookings,
        overdue_allocations=overdue,
        pending_maintenance_requests=pending_maint,
        pending_transfers=pending_trans,
    )


async def get_asset_utilization(session: AsyncSession) -> AssetUtilizationResponse:
    repo = ReportsRepository(session)
    total = await repo.get_total_assets_count()
    allocated = await repo.get_assets_count_by_status("allocated")
    available = await repo.get_assets_count_by_status("available")
    maintenance = await repo.get_assets_count_by_status("under_maintenance")
    util_rate = round(allocated / total, 4) if total > 0 else 0.0
    return AssetUtilizationResponse(
        total_assets=total,
        allocated=allocated,
        available=available,
        under_maintenance=maintenance,
        utilization_rate=util_rate,
    )


async def get_maintenance_frequency(session: AsyncSession, limit: int = 10) -> list[MaintenanceFrequencyItem]:
    repo = ReportsRepository(session)
    raw = await repo.get_maintenance_frequency(limit)
    return [
        MaintenanceFrequencyItem(
            asset_id=str(r[0]), asset_name=r[1], asset_tag=r[2], maintenance_count=r[3]
        )
        for r in raw
    ]


async def get_department_allocation_summary(session: AsyncSession) -> list[DepartmentAllocationItem]:
    repo = ReportsRepository(session)
    raw = await repo.get_department_allocation_summary()
    return [
        DepartmentAllocationItem(
            department_id=str(r[0]), department_name=r[1], total_allocations=r[2]
        )
        for r in raw
    ]


async def get_booking_heatmap(session: AsyncSession) -> list[BookingHeatmapItem]:
    repo = ReportsRepository(session)
    raw = await repo.get_booking_heatmap()
    return [BookingHeatmapItem(hour=int(r[0]), booking_count=r[1]) for r in raw]


async def get_most_used_assets(session: AsyncSession, limit: int = 10) -> list[MostUsedAssetItem]:
    repo = ReportsRepository(session)
    raw = await repo.get_most_used_assets(limit)
    return [
        MostUsedAssetItem(
            asset_id=r[0], name=r[1], asset_tag=r[2], usage_count=r[3], description=f"{r[3]} uses"
        )
        for r in raw
    ]


async def get_idle_assets(session: AsyncSession, limit: int = 10) -> list[IdleAssetItem]:
    repo = ReportsRepository(session)
    raw = await repo.get_idle_assets(limit)
    items = []
    for r in raw:
        days = _calculate_days_idle(r[3])
        items.append(
            IdleAssetItem(
                asset_id=r[0], name=r[1], asset_tag=r[2], days_idle=days, description=f"unused {days} days"
            )
        )
    return items


async def get_maintenance_retirement_summary(session: AsyncSession) -> MaintenanceAndRetirementResponse:
    repo = ReportsRepository(session)
    due_raw = await repo.get_maintenance_due_assets()
    ret_raw = await repo.get_nearing_retirement_assets()
    due_items = []
    for asset in due_raw:
        days = (asset.next_maintenance_date - date.today()).days
        desc = f"service due in {days} days" if days >= 0 else f"service overdue by {abs(days)} days"
        due_items.append(
            MaintenanceDueItem(
                asset_id=asset.id,
                name=asset.name,
                asset_tag=asset.asset_tag,
                next_maintenance_date=asset.next_maintenance_date,
                days_remaining=days,
                description=desc,
            )
        )
    ret_items = []
    for asset in ret_raw:
        age_years = round((date.today() - asset.acquisition_date).days / 365.25, 1)
        if age_years >= (asset.expected_lifespan_years - 1):
            ret_items.append(
                NearingRetirementItem(
                    asset_id=asset.id,
                    name=asset.name,
                    asset_tag=asset.asset_tag,
                    age_years=age_years,
                    expected_lifespan_years=asset.expected_lifespan_years,
                    description=f"{age_years} years old : nearing retirement",
                )
            )
    return MaintenanceAndRetirementResponse(due_for_maintenance=due_items, nearing_retirement=ret_items)


async def get_reports_summary(session: AsyncSession) -> ReportsSummaryResponse:
    util = await get_asset_utilization(session)
    depts = await get_department_allocation_summary(session)
    maint = await get_maintenance_frequency(session)
    most_used = await get_most_used_assets(session)
    idle = await get_idle_assets(session)
    maint_ret = await get_maintenance_retirement_summary(session)
    return ReportsSummaryResponse(
        utilization=util,
        departments=depts,
        maintenance_frequency=maint,
        most_used=most_used,
        idle=idle,
        maintenance_retirement=maint_ret,
    )


async def export_reports_csv(session: AsyncSession) -> str:
    kpis = await get_dashboard_kpis(session)
    depts = await get_department_allocation_summary(session)
    most_used = await get_most_used_assets(session)
    idle = await get_idle_assets(session)
    maint_ret = await get_maintenance_retirement_summary(session)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Asset Flow - Comprehensive Reports Export"])
    writer.writerow([f"Generated Date: {date.today().isoformat()}"])
    writer.writerow([])
    writer.writerow(["SECTION 1 - KEY METRICS"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Assets Available", kpis.assets_available])
    writer.writerow(["Assets Allocated", kpis.assets_allocated])
    writer.writerow(["Assets Under Maintenance", kpis.assets_under_maintenance])
    writer.writerow(["Active Bookings", kpis.active_bookings])
    writer.writerow(["Overdue Allocations", kpis.overdue_allocations])
    writer.writerow([])
    writer.writerow(["SECTION 2 - DEPARTMENT UTILIZATION"])
    writer.writerow(["Department Name", "Active Allocations"])
    for d in depts:
        writer.writerow([d.department_name, d.total_allocations])
    writer.writerow([])
    writer.writerow(["SECTION 3 - MOST USED ASSETS"])
    writer.writerow(["Asset Name", "Asset Tag", "Usage Count", "Status"])
    for m in most_used:
        writer.writerow([m.name, m.asset_tag, m.usage_count, m.description])
    writer.writerow([])
    writer.writerow(["SECTION 4 - IDLE ASSETS"])
    writer.writerow(["Asset Name", "Asset Tag", "Days Inactive", "Status"])
    for i in idle:
        writer.writerow([i.name, i.asset_tag, i.days_idle, i.description])
    writer.writerow([])
    writer.writerow(["SECTION 5 - MAINTENANCE DUE & RETIREMENT"])
    writer.writerow(["Type", "Asset Name", "Asset Tag", "Status Detail"])
    for dm in maint_ret.due_for_maintenance:
        writer.writerow(["Maintenance Due", dm.name, dm.asset_tag, dm.description])
    for nr in maint_ret.nearing_retirement:
        writer.writerow(["Nearing Retirement", nr.name, nr.asset_tag, nr.description])
    return output.getvalue()
