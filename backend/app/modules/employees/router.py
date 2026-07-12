import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.enums import UserRole
from app.modules.employees import service
from app.modules.employees.schemas import (
    CreateEmployeeRequest,
    EmployeeResponse,
    UpdateEmployeeRequest,
    UpdateRoleRequest,
    UpdateStatusRequest,
)
from app.shared.dependencies import CurrentEmployeeId, SessionDep, require_role
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()

AdminOnly = require_role(UserRole.ADMIN)


@router.get("", response_model=PaginatedResponse[EmployeeResponse])
async def list_employees(
    session: SessionDep,
    _: Annotated[None, AdminOnly],
    params: Annotated[PageParams, Depends(PageParams)],
) -> PaginatedResponse[EmployeeResponse]:
    return await service.list_employees(session, params)


@router.post("", response_model=EmployeeResponse, status_code=201)
async def create_employee(
    request: CreateEmployeeRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> EmployeeResponse:
    return await service.create_employee(request, session)


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: uuid.UUID, session: SessionDep) -> EmployeeResponse:
    return await service.get_employee(employee_id, session)


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: uuid.UUID,
    request: UpdateEmployeeRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> EmployeeResponse:
    return await service.update_employee(employee_id, request, session)


@router.patch("/{employee_id}/role", response_model=EmployeeResponse)
async def update_role(
    employee_id: uuid.UUID,
    request: UpdateRoleRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, AdminOnly],
) -> EmployeeResponse:
    return await service.update_employee_role(
        employee_id, request, current_employee_id, session
    )


@router.patch("/{employee_id}/status", response_model=EmployeeResponse)
async def update_status(
    employee_id: uuid.UUID,
    request: UpdateStatusRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, AdminOnly],
) -> EmployeeResponse:
    return await service.update_employee_status(
        employee_id, request, current_employee_id, session
    )
