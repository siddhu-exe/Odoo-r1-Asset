import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import AssetStatus, AuditItemStatus, AuditStatus
from app.core.exceptions import ConflictError
from app.modules.assets.models import Asset
from app.modules.audits.models import AuditAssignment, AuditCycle, AuditItem
from app.modules.audits.repository import (
    AuditAssignmentRepository,
    AuditCycleRepository,
    AuditItemRepository,
)
from app.modules.audits.schemas import (
    AssignAuditorRequest,
    CreateAuditCycleRequest,
    DiscrepancyReportResponse,
    UpdateAuditItemRequest,
)
from app.shared.pagination import PageParams, PaginatedResponse


async def list_audit_cycles(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[AuditCycle]:
    repository = AuditCycleRepository(session)
    total = await repository.count_all()
    cycles = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=cycles, total=total, params=params)


async def create_audit_cycle(
    request: CreateAuditCycleRequest,
    created_by: uuid.UUID,
    session: AsyncSession,
) -> AuditCycle:
    repository = AuditCycleRepository(session)

    cycle = AuditCycle(
        name=request.name,
        scope_department_id=request.scope_department_id,
        scope_location=request.scope_location,
        start_date=request.start_date,
        end_date=request.end_date,
        status=AuditStatus.OPEN,
        created_by=created_by,
    )
    created_cycle = await repository.create(cycle)

    assets_query = select(Asset).where(Asset.status != AssetStatus.DISPOSED)

    if request.scope_department_id:
        from sqlalchemy import select as sa_select
        from app.modules.allocations.models import Allocation
        from app.core.enums import AllocationStatus
        allocated_asset_ids_result = await session.execute(
            sa_select(Allocation.asset_id).where(
                Allocation.department_id == request.scope_department_id,
                Allocation.status == AllocationStatus.ACTIVE,
            )
        )
        asset_ids = [row[0] for row in allocated_asset_ids_result.fetchall()]
        assets_query = select(Asset).where(Asset.id.in_(asset_ids))

    if request.scope_location:
        assets_query = assets_query.where(Asset.location == request.scope_location)

    assets_result = await session.execute(assets_query)
    assets = assets_result.scalars().all()

    item_repository = AuditItemRepository(session)
    for asset in assets:
        item = AuditItem(
            cycle_id=created_cycle.id,
            asset_id=asset.id,
            status=AuditItemStatus.PENDING,
        )
        session.add(item)

    await session.flush()
    return created_cycle


async def assign_auditor(
    cycle_id: uuid.UUID,
    request: AssignAuditorRequest,
    session: AsyncSession,
) -> AuditAssignment:
    cycle_repository = AuditCycleRepository(session)
    await cycle_repository.get_by_id_or_raise(cycle_id)

    assignment = AuditAssignment(
        cycle_id=cycle_id,
        auditor_id=request.auditor_id,
    )

    assignment_repository = AuditAssignmentRepository(session)
    return await assignment_repository.create(assignment)


async def update_audit_item(
    cycle_id: uuid.UUID,
    item_id: uuid.UUID,
    request: UpdateAuditItemRequest,
    auditor_id: uuid.UUID,
    session: AsyncSession,
) -> AuditItem:
    item_repository = AuditItemRepository(session)
    item = await item_repository.get_by_id_or_raise(item_id)

    if item.cycle_id != cycle_id:
        raise ConflictError("Audit item does not belong to this cycle.")

    item.status = request.status
    item.notes = request.notes
    item.auditor_id = auditor_id
    item.verified_at = datetime.now(timezone.utc)

    await session.flush()
    await session.refresh(item)
    return item


async def generate_discrepancy_report(
    cycle_id: uuid.UUID,
    session: AsyncSession,
) -> DiscrepancyReportResponse:
    item_repository = AuditItemRepository(session)
    items = await item_repository.list_for_cycle(cycle_id)

    counts: dict[AuditItemStatus, int] = {status: 0 for status in AuditItemStatus}
    for item in items:
        counts[item.status] += 1

    return DiscrepancyReportResponse(
        cycle_id=cycle_id,
        total_assets=len(items),
        verified=counts[AuditItemStatus.VERIFIED],
        missing=counts[AuditItemStatus.MISSING],
        damaged=counts[AuditItemStatus.DAMAGED],
        pending=counts[AuditItemStatus.PENDING],
    )


async def close_audit_cycle(
    cycle_id: uuid.UUID,
    session: AsyncSession,
) -> AuditCycle:
    cycle_repository = AuditCycleRepository(session)
    cycle = await cycle_repository.get_by_id_or_raise(cycle_id)

    if cycle.status == AuditStatus.CLOSED:
        raise ConflictError("Audit cycle is already closed.")

    item_repository = AuditItemRepository(session)
    items = await item_repository.list_for_cycle(cycle_id)

    for item in items:
        if item.status == AuditItemStatus.MISSING:
            asset_result = await session.execute(
                select(Asset).where(Asset.id == item.asset_id)
            )
            asset = asset_result.scalar_one_or_none()
            if asset:
                asset.status = AssetStatus.LOST

    cycle.status = AuditStatus.CLOSED

    await session.flush()
    await session.refresh(cycle)
    return cycle
