import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import AllocationStatus, AssetStatus, TransferStatus
from app.core.exceptions import ConflictError, ForbiddenError, ValidationError
from app.modules.allocations.models import Allocation, TransferRequest
from app.modules.allocations.repository import AllocationRepository, TransferRequestRepository
from app.modules.allocations.schemas import (
    AllocationResponse,
    CreateAllocationRequest,
    CreateTransferRequest,
    RejectTransferRequest,
    ReturnAssetRequest,
)
from app.modules.assets.repository import AssetRepository
from app.shared.pagination import PageParams, PaginatedResponse


async def list_allocations(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[AllocationResponse]:
    repository = AllocationRepository(session)
    total = await repository.count_all()
    allocations = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=allocations, total=total, params=params)


async def create_allocation(
    request: CreateAllocationRequest,
    allocated_by: uuid.UUID,
    session: AsyncSession,
) -> Allocation:
    if request.employee_id is None and request.department_id is None:
        raise ValidationError("Either employee_id or department_id must be provided.")

    asset_repository = AssetRepository(session)
    asset = await asset_repository.get_by_id_or_raise(request.asset_id)

    if asset.status not in (AssetStatus.AVAILABLE,):
        active_allocation = await AllocationRepository(session).get_active_allocation_for_asset(
            request.asset_id
        )
        holder_name = "unknown"
        if active_allocation and active_allocation.employee:
            holder_name = (
                f"{active_allocation.employee.first_name} {active_allocation.employee.last_name}"
            )
        raise ConflictError(
            f"Asset '{asset.name}' is currently held by {holder_name}. "
            "Use the transfer request flow instead."
        )

    allocation = Allocation(
        asset_id=request.asset_id,
        employee_id=request.employee_id,
        department_id=request.department_id,
        allocated_by=allocated_by,
        expected_return_date=request.expected_return_date,
        status=AllocationStatus.ACTIVE,
    )

    asset.status = AssetStatus.ALLOCATED

    allocation_repository = AllocationRepository(session)
    return await allocation_repository.create(allocation)


async def return_asset(
    allocation_id: uuid.UUID,
    request: ReturnAssetRequest,
    approved_by: uuid.UUID,
    session: AsyncSession,
) -> Allocation:
    repository = AllocationRepository(session)
    allocation = await repository.get_by_id_or_raise(allocation_id)

    if allocation.status != AllocationStatus.ACTIVE:
        raise ConflictError("This allocation has already been closed.")

    from datetime import datetime, timezone

    allocation.status = AllocationStatus.RETURNED
    allocation.returned_at = datetime.now(timezone.utc)
    allocation.condition_on_return = request.condition_on_return
    allocation.return_notes = request.return_notes
    allocation.return_approved_by = approved_by

    asset_repository = AssetRepository(session)
    asset = await asset_repository.get_by_id_or_raise(allocation.asset_id)
    asset.status = AssetStatus.AVAILABLE

    await session.flush()
    await session.refresh(allocation)
    return allocation


async def list_overdue_allocations(session: AsyncSession) -> list[Allocation]:
    repository = AllocationRepository(session)
    return await repository.list_overdue()


async def create_transfer_request(
    request: CreateTransferRequest,
    requested_by: uuid.UUID,
    session: AsyncSession,
) -> TransferRequest:
    allocation_repository = AllocationRepository(session)
    active_allocation = await allocation_repository.get_active_allocation_for_asset(
        request.asset_id
    )

    if active_allocation is None:
        raise ConflictError("Asset is not currently allocated, so no transfer is needed.")

    if active_allocation.employee_id != requested_by:
        raise ForbiddenError("You can only request transfer of assets currently allocated to you.")

    transfer = TransferRequest(
        asset_id=request.asset_id,
        from_employee_id=active_allocation.employee_id,
        to_employee_id=request.to_employee_id,
        requested_by=requested_by,
        reason=request.reason,
        status=TransferStatus.PENDING,
    )

    transfer_repository = TransferRequestRepository(session)
    return await transfer_repository.create(transfer)


async def approve_transfer(
    transfer_id: uuid.UUID,
    approved_by: uuid.UUID,
    session: AsyncSession,
) -> TransferRequest:
    transfer_repository = TransferRequestRepository(session)
    transfer = await transfer_repository.get_by_id_or_raise(transfer_id)

    if transfer.status != TransferStatus.PENDING:
        raise ConflictError("This transfer request is no longer pending.")

    transfer.status = TransferStatus.APPROVED
    transfer.approved_by = approved_by

    allocation_repository = AllocationRepository(session)
    old_allocation = await allocation_repository.get_active_allocation_for_asset(transfer.asset_id)

    if old_allocation:
        from datetime import datetime, timezone
        old_allocation.status = AllocationStatus.RETURNED
        old_allocation.returned_at = datetime.now(timezone.utc)

    new_allocation = Allocation(
        asset_id=transfer.asset_id,
        employee_id=transfer.to_employee_id,
        allocated_by=approved_by,
        status=AllocationStatus.ACTIVE,
    )
    await allocation_repository.create(new_allocation)

    await session.flush()
    await session.refresh(transfer)
    return transfer


async def reject_transfer(
    transfer_id: uuid.UUID,
    request: RejectTransferRequest,
    rejected_by: uuid.UUID,
    session: AsyncSession,
) -> TransferRequest:
    transfer_repository = TransferRequestRepository(session)
    transfer = await transfer_repository.get_by_id_or_raise(transfer_id)

    if transfer.status != TransferStatus.PENDING:
        raise ConflictError("This transfer request is no longer pending.")

    transfer.status = TransferStatus.REJECTED
    transfer.approved_by = rejected_by
    transfer.rejection_notes = request.rejection_notes

    await session.flush()
    await session.refresh(transfer)
    return transfer
