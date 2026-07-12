import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.enums import UserRole
from app.modules.audits import service
from app.modules.audits.schemas import (
    AssignAuditorRequest,
    AuditCycleResponse,
    AuditItemResponse,
    CreateAuditCycleRequest,
    DiscrepancyReportResponse,
    UpdateAuditItemRequest,
)
from app.shared.dependencies import CurrentEmployeeId, SessionDep, require_role
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()

AdminOnly = require_role(UserRole.ADMIN)


@router.get("", response_model=PaginatedResponse[AuditCycleResponse])
async def list_audit_cycles(
    session: SessionDep,
    params: Annotated[PageParams, Depends(PageParams)],
) -> PaginatedResponse[AuditCycleResponse]:
    return await service.list_audit_cycles(session, params)


@router.get("/{cycle_id}", response_model=AuditCycleResponse)
async def get_audit_cycle(
    cycle_id: uuid.UUID,
    session: SessionDep,
) -> AuditCycleResponse:
    return await service.get_audit_cycle(cycle_id, session)


@router.get("/{cycle_id}/items", response_model=list[AuditItemResponse])
async def list_audit_items(
    cycle_id: uuid.UUID,
    session: SessionDep,
) -> list[AuditItemResponse]:
    return await service.list_audit_items(cycle_id, session)


@router.post("", response_model=AuditCycleResponse, status_code=201)
async def create_audit_cycle(
    request: CreateAuditCycleRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
    _: Annotated[None, AdminOnly],
) -> AuditCycleResponse:
    return await service.create_audit_cycle(request, current_employee_id, session)


@router.post("/{cycle_id}/auditors", response_model=dict, status_code=201)
async def assign_auditor(
    cycle_id: uuid.UUID,
    request: AssignAuditorRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> dict:
    assignment = await service.assign_auditor(cycle_id, request, session)
    return {"id": str(assignment.id), "cycle_id": str(assignment.cycle_id)}


@router.patch("/{cycle_id}/items/{item_id}", response_model=AuditItemResponse)
async def update_audit_item(
    cycle_id: uuid.UUID,
    item_id: uuid.UUID,
    request: UpdateAuditItemRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> AuditItemResponse:
    return await service.update_audit_item(
        cycle_id, item_id, request, current_employee_id, session
    )


@router.post("/{cycle_id}/report", response_model=DiscrepancyReportResponse)
async def generate_discrepancy_report(
    cycle_id: uuid.UUID,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> DiscrepancyReportResponse:
    return await service.generate_discrepancy_report(cycle_id, session)


@router.patch("/{cycle_id}/close", response_model=AuditCycleResponse)
async def close_audit_cycle(
    cycle_id: uuid.UUID,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> AuditCycleResponse:
    return await service.close_audit_cycle(cycle_id, session)
