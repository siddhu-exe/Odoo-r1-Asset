import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.enums import UserRole
from app.modules.allocations import service
from app.modules.allocations.schemas import (
    AllocationResponse,
    CreateAllocationRequest,
    CreateTransferRequest,
    RejectTransferRequest,
    ReturnAssetRequest,
    TransferRequestResponse,
)
from app.shared.dependencies import CurrentEmployeeId, SessionDep, require_role
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()

AssetManagerOnly = require_role(UserRole.ASSET_MANAGER, UserRole.ADMIN)
ManagerOrDeptHead = require_role(
    UserRole.ASSET_MANAGER, UserRole.ADMIN, UserRole.DEPARTMENT_HEAD
)


@router.get("", response_model=PaginatedResponse[AllocationResponse])
async def list_allocations(
    session: SessionDep,
    params: Annotated[PageParams, Depends(PageParams)],
) -> PaginatedResponse[AllocationResponse]:
    return await service.list_allocations(session, params)


@router.post("", response_model=AllocationResponse, status_code=201)
async def create_allocation(
    request: CreateAllocationRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, AssetManagerOnly],
) -> AllocationResponse:
    return await service.create_allocation(request, current_employee_id, session)


@router.get("/transfers", response_model=list[TransferRequestResponse])
async def list_transfers(
    session: SessionDep,
) -> list[TransferRequestResponse]:
    return await service.list_transfers(session)


@router.get("/overdue", response_model=list[AllocationResponse])
async def list_overdue(
    session: SessionDep,
    _: Annotated[None, AssetManagerOnly],
) -> list[AllocationResponse]:
    return await service.list_overdue_allocations(session)


@router.get("/{allocation_id}", response_model=AllocationResponse)
async def get_allocation(
    allocation_id: uuid.UUID,
    session: SessionDep,
) -> AllocationResponse:
    return await service.get_allocation(allocation_id, session)


@router.post("/{allocation_id}/return", response_model=AllocationResponse)
async def return_asset(
    allocation_id: uuid.UUID,
    request: ReturnAssetRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, AssetManagerOnly],
) -> AllocationResponse:
    return await service.return_asset(allocation_id, request, current_employee_id, session)


@router.post("/transfers", response_model=TransferRequestResponse, status_code=201)
async def create_transfer_request(
    request: CreateTransferRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> TransferRequestResponse:
    return await service.create_transfer_request(request, current_employee_id, session)


@router.patch("/transfers/{transfer_id}/approve", response_model=TransferRequestResponse)
async def approve_transfer(
    transfer_id: uuid.UUID,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, ManagerOrDeptHead],
) -> TransferRequestResponse:
    return await service.approve_transfer(transfer_id, current_employee_id, session)


@router.patch("/transfers/{transfer_id}/reject", response_model=TransferRequestResponse)
async def reject_transfer(
    transfer_id: uuid.UUID,
    request: RejectTransferRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, ManagerOrDeptHead],
) -> TransferRequestResponse:
    return await service.reject_transfer(transfer_id, request, current_employee_id, session)
