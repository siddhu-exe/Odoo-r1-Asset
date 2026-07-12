from typing import Annotated

from fastapi import APIRouter

from app.core.enums import UserRole
from app.modules.reports import service
from app.modules.reports.schemas import (
    AssetUtilizationResponse,
    BookingHeatmapItem,
    DashboardKpiResponse,
    DepartmentAllocationItem,
    MaintenanceFrequencyItem,
)
from app.shared.dependencies import SessionDep, require_role


router = APIRouter()

AdminOnly = require_role(UserRole.ADMIN)
ManagerOrAdmin = require_role(UserRole.ASSET_MANAGER, UserRole.ADMIN)


@router.get("/dashboard", response_model=DashboardKpiResponse)
async def get_dashboard_kpis(session: SessionDep) -> DashboardKpiResponse:
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
    _: Annotated[None, AdminOnly],
) -> list[DepartmentAllocationItem]:
    return await service.get_department_allocation_summary(session)


@router.get("/booking-heatmap", response_model=list[BookingHeatmapItem])
async def get_booking_heatmap(
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> list[BookingHeatmapItem]:
    return await service.get_booking_heatmap(session)
