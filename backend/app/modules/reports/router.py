import io
from typing import Annotated

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.enums import UserRole
from app.modules.reports import service
from app.modules.reports.schemas import (
    AssetUtilizationResponse,
    BookingHeatmapItem,
    DashboardKpiResponse,
    DepartmentAllocationItem,
    IdleAssetItem,
    MaintenanceAndRetirementResponse,
    MaintenanceFrequencyItem,
    MostUsedAssetItem,
    ReportsSummaryResponse,
)
from app.shared.dependencies import SessionDep, require_role


router = APIRouter()

AdminOnly = require_role(UserRole.ADMIN)
ManagerOrAdmin = require_role(UserRole.ASSET_MANAGER, UserRole.ADMIN)


@router.get("/dashboard", response_model=DashboardKpiResponse)
async def get_dashboard_kpis(
    session: SessionDep,
) -> DashboardKpiResponse:
    return await service.get_dashboard_kpis(session)


@router.get("/utilization", response_model=AssetUtilizationResponse)
async def get_asset_utilization(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> AssetUtilizationResponse:
    return await service.get_asset_utilization(session)


@router.get("/maintenance", response_model=list[MaintenanceFrequencyItem])
async def get_maintenance_frequency(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> list[MaintenanceFrequencyItem]:
    return await service.get_maintenance_frequency(session)


@router.get("/departments", response_model=list[DepartmentAllocationItem])
async def get_department_allocation_summary(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> list[DepartmentAllocationItem]:
    return await service.get_department_allocation_summary(session)


@router.get("/booking-heatmap", response_model=list[BookingHeatmapItem])
async def get_booking_heatmap(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> list[BookingHeatmapItem]:
    return await service.get_booking_heatmap(session)


@router.get("/most-used", response_model=list[MostUsedAssetItem])
async def get_most_used_assets(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> list[MostUsedAssetItem]:
    return await service.get_most_used_assets(session)


@router.get("/idle", response_model=list[IdleAssetItem])
async def get_idle_assets(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> list[IdleAssetItem]:
    return await service.get_idle_assets(session)


@router.get("/maintenance-retirement", response_model=MaintenanceAndRetirementResponse)
async def get_maintenance_retirement_summary(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> MaintenanceAndRetirementResponse:
    return await service.get_maintenance_retirement_summary(session)


@router.get("/summary", response_model=ReportsSummaryResponse)
async def get_reports_summary(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> ReportsSummaryResponse:
    return await service.get_reports_summary(session)


@router.get("/export")
async def export_reports(
    session: SessionDep,
    _: Annotated[None, ManagerOrAdmin],
) -> StreamingResponse:
    csv_content = await service.export_reports_csv(session)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reports_export.csv"},
    )
