import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.enums import UserRole
from app.modules.maintenance import service
from app.modules.maintenance.schemas import (
    AssignTechnicianRequest,
    CreateMaintenanceRequest,
    MaintenanceRequestResponse,
    ResolveRequest,
)
from app.shared.dependencies import CurrentEmployeeId, SessionDep, require_role
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()

AssetManagerOnly = require_role(UserRole.ASSET_MANAGER, UserRole.ADMIN)


@router.get("", response_model=PaginatedResponse[MaintenanceRequestResponse])
async def list_maintenance_requests(
    session: SessionDep,
    params: Annotated[PageParams, Depends(PageParams)],
) -> PaginatedResponse[MaintenanceRequestResponse]:
    return await service.list_maintenance_requests(session, params)


@router.get("/{request_id}", response_model=MaintenanceRequestResponse)
async def get_maintenance_request(
    request_id: uuid.UUID,
    session: SessionDep,
) -> MaintenanceRequestResponse:
    return await service.get_maintenance_request(request_id, session)


@router.post("", response_model=MaintenanceRequestResponse, status_code=201)
async def create_maintenance_request(
    request: CreateMaintenanceRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> MaintenanceRequestResponse:
    return await service.create_maintenance_request(request, current_employee_id, session)


@router.patch("/{request_id}/approve", response_model=MaintenanceRequestResponse)
async def approve_request(
    request_id: uuid.UUID,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, AssetManagerOnly],
) -> MaintenanceRequestResponse:
    return await service.approve_request(request_id, current_employee_id, session)


@router.patch("/{request_id}/reject", response_model=MaintenanceRequestResponse)
async def reject_request(
    request_id: uuid.UUID,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, AssetManagerOnly],
) -> MaintenanceRequestResponse:
    return await service.reject_request(request_id, current_employee_id, session)


@router.patch("/{request_id}/assign", response_model=MaintenanceRequestResponse)
async def assign_technician(
    request_id: uuid.UUID,
    request: AssignTechnicianRequest,
    session: SessionDep,
    _: Annotated[None, AssetManagerOnly],
) -> MaintenanceRequestResponse:
    return await service.assign_technician(request_id, request, session)


@router.patch("/{request_id}/start", response_model=MaintenanceRequestResponse)
async def start_maintenance(
    request_id: uuid.UUID,
    session: SessionDep,
    _: Annotated[None, AssetManagerOnly],
) -> MaintenanceRequestResponse:
    return await service.start_maintenance(request_id, session)


@router.patch("/{request_id}/resolve", response_model=MaintenanceRequestResponse)
async def resolve_request(
    request_id: uuid.UUID,
    request: ResolveRequest,
    session: SessionDep,
    _: Annotated[None, AssetManagerOnly],
) -> MaintenanceRequestResponse:
    return await service.resolve_request(request_id, request, session)
