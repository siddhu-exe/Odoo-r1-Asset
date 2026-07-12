import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.enums import UserRole
from app.modules.departments import service
from app.modules.departments.schemas import (
    CreateDepartmentRequest,
    DepartmentResponse,
    UpdateDepartmentRequest,
    UpdateStatusRequest,
)
from app.shared.dependencies import SessionDep, require_role
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()

AdminOnly = require_role(UserRole.ADMIN)


@router.get("", response_model=PaginatedResponse[DepartmentResponse])
async def list_departments(
    session: SessionDep,
    params: Annotated[PageParams, Depends(PageParams)],
) -> PaginatedResponse[DepartmentResponse]:
    return await service.list_departments(session, params)


@router.post("", response_model=DepartmentResponse, status_code=201)
async def create_department(
    request: CreateDepartmentRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> DepartmentResponse:
    return await service.create_department(request, session)


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: uuid.UUID, session: SessionDep
) -> DepartmentResponse:
    return await service.get_department(department_id, session)


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: uuid.UUID,
    request: UpdateDepartmentRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> DepartmentResponse:
    return await service.update_department(department_id, request, session)


@router.patch("/{department_id}/status", response_model=DepartmentResponse)
async def update_status(
    department_id: uuid.UUID,
    request: UpdateStatusRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> DepartmentResponse:
    return await service.update_department_status(department_id, request, session)
