import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import AssetStatus, MaintenanceStatus
from app.core.exceptions import ConflictError, ValidationError
from app.modules.assets.repository import AssetRepository
from app.modules.maintenance.models import MaintenanceRequest
from app.modules.maintenance.repository import MaintenanceRepository
from app.modules.maintenance.schemas import (
    AssignTechnicianRequest,
    CreateMaintenanceRequest,
    ResolveRequest,
)
from app.shared.pagination import PageParams, PaginatedResponse


VALID_TRANSITIONS: dict[MaintenanceStatus, set[MaintenanceStatus]] = {
    MaintenanceStatus.PENDING: {MaintenanceStatus.APPROVED, MaintenanceStatus.REJECTED},
    MaintenanceStatus.APPROVED: {MaintenanceStatus.ASSIGNED},
    MaintenanceStatus.ASSIGNED: {MaintenanceStatus.IN_PROGRESS},
    MaintenanceStatus.IN_PROGRESS: {MaintenanceStatus.RESOLVED},
    MaintenanceStatus.REJECTED: set(),
    MaintenanceStatus.RESOLVED: set(),
}


def assert_valid_transition(
    current_status: MaintenanceStatus,
    target_status: MaintenanceStatus,
) -> None:
    if target_status not in VALID_TRANSITIONS.get(current_status, set()):
        raise ValidationError(
            f"Cannot transition from '{current_status}' to '{target_status}'."
        )


async def list_maintenance_requests(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[MaintenanceRequest]:
    repository = MaintenanceRepository(session)
    total = await repository.count_all()
    requests = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=requests, total=total, params=params)


async def create_maintenance_request(
    request: CreateMaintenanceRequest,
    raised_by: uuid.UUID,
    session: AsyncSession,
) -> MaintenanceRequest:
    asset_repository = AssetRepository(session)
    await asset_repository.get_by_id_or_raise(request.asset_id)

    maintenance_request = MaintenanceRequest(
        asset_id=request.asset_id,
        raised_by=raised_by,
        description=request.description,
        priority=request.priority,
        photo_url=request.photo_url,
        status=MaintenanceStatus.PENDING,
    )

    repository = MaintenanceRepository(session)
    return await repository.create(maintenance_request)


async def approve_request(
    request_id: uuid.UUID,
    approved_by: uuid.UUID,
    session: AsyncSession,
) -> MaintenanceRequest:
    repository = MaintenanceRepository(session)
    maintenance_request = await repository.get_by_id_or_raise(request_id)

    assert_valid_transition(maintenance_request.status, MaintenanceStatus.APPROVED)

    maintenance_request.status = MaintenanceStatus.APPROVED
    maintenance_request.approved_by = approved_by

    asset_repository = AssetRepository(session)
    asset = await asset_repository.get_by_id_or_raise(maintenance_request.asset_id)
    asset.status = AssetStatus.UNDER_MAINTENANCE

    await session.flush()
    await session.refresh(maintenance_request)
    return maintenance_request


async def reject_request(
    request_id: uuid.UUID,
    rejected_by: uuid.UUID,
    session: AsyncSession,
) -> MaintenanceRequest:
    repository = MaintenanceRepository(session)
    maintenance_request = await repository.get_by_id_or_raise(request_id)

    assert_valid_transition(maintenance_request.status, MaintenanceStatus.REJECTED)

    maintenance_request.status = MaintenanceStatus.REJECTED
    maintenance_request.approved_by = rejected_by

    await session.flush()
    await session.refresh(maintenance_request)
    return maintenance_request


async def assign_technician(
    request_id: uuid.UUID,
    request: AssignTechnicianRequest,
    session: AsyncSession,
) -> MaintenanceRequest:
    repository = MaintenanceRepository(session)
    maintenance_request = await repository.get_by_id_or_raise(request_id)

    assert_valid_transition(maintenance_request.status, MaintenanceStatus.ASSIGNED)

    maintenance_request.status = MaintenanceStatus.ASSIGNED
    maintenance_request.technician_id = request.technician_id

    await session.flush()
    await session.refresh(maintenance_request)
    return maintenance_request


async def start_maintenance(
    request_id: uuid.UUID,
    session: AsyncSession,
) -> MaintenanceRequest:
    repository = MaintenanceRepository(session)
    maintenance_request = await repository.get_by_id_or_raise(request_id)

    assert_valid_transition(maintenance_request.status, MaintenanceStatus.IN_PROGRESS)

    maintenance_request.status = MaintenanceStatus.IN_PROGRESS

    await session.flush()
    await session.refresh(maintenance_request)
    return maintenance_request


async def resolve_request(
    request_id: uuid.UUID,
    request: ResolveRequest,
    session: AsyncSession,
) -> MaintenanceRequest:
    repository = MaintenanceRepository(session)
    maintenance_request = await repository.get_by_id_or_raise(request_id)

    assert_valid_transition(maintenance_request.status, MaintenanceStatus.RESOLVED)

    maintenance_request.status = MaintenanceStatus.RESOLVED
    maintenance_request.resolved_at = datetime.now(timezone.utc)
    maintenance_request.resolution_notes = request.resolution_notes

    asset_repository = AssetRepository(session)
    asset = await asset_repository.get_by_id_or_raise(maintenance_request.asset_id)
    asset.status = AssetStatus.AVAILABLE

    await session.flush()
    await session.refresh(maintenance_request)
    return maintenance_request
