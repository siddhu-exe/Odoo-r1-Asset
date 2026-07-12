import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.modules.allocations.models import Allocation
from app.modules.assets.models import Asset
from app.modules.assets.repository import AssetRepository
from app.modules.assets.schemas import (
    AssetHistoryResponse,
    CreateAssetRequest,
    UpdateAssetRequest,
)
from app.modules.maintenance.models import MaintenanceRequest
from app.shared.pagination import PageParams, PaginatedResponse


async def list_assets(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[Asset]:
    repository = AssetRepository(session)
    total = await repository.count_all()
    assets = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=assets, total=total, params=params)


async def get_asset(asset_id: uuid.UUID, session: AsyncSession) -> Asset:
    repository = AssetRepository(session)
    return await repository.get_by_id_or_raise(asset_id)


async def create_asset(
    request: CreateAssetRequest,
    session: AsyncSession,
) -> Asset:
    repository = AssetRepository(session)

    if request.serial_number:
        existing = await repository.get_by_serial_number(request.serial_number)
        if existing is not None:
            raise ConflictError(
                f"An asset with serial number '{request.serial_number}' already exists."
            )

    asset_tag = await repository.next_asset_tag()

    asset = Asset(
        name=request.name,
        asset_tag=asset_tag,
        serial_number=request.serial_number,
        category_id=request.category_id,
        condition=request.condition,
        location=request.location,
        is_bookable=request.is_bookable,
        acquisition_date=request.acquisition_date,
        acquisition_cost=request.acquisition_cost,
        photo_url=request.photo_url,
        document_url=request.document_url,
        notes=request.notes,
    )
    return await repository.create(asset)


async def update_asset(
    asset_id: uuid.UUID,
    request: UpdateAssetRequest,
    session: AsyncSession,
) -> Asset:
    repository = AssetRepository(session)
    asset = await repository.get_by_id_or_raise(asset_id)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)

    await session.flush()
    await session.refresh(asset)
    return asset


async def get_asset_history(
    asset_id: uuid.UUID,
    session: AsyncSession,
) -> AssetHistoryResponse:
    repository = AssetRepository(session)
    await repository.get_by_id_or_raise(asset_id)

    allocations_result = await session.execute(
        select(Allocation).where(Allocation.asset_id == asset_id)
    )
    maintenance_result = await session.execute(
        select(MaintenanceRequest).where(MaintenanceRequest.asset_id == asset_id)
    )

    allocations = [
        {"id": str(a.id), "status": a.status, "allocated_at": str(a.created_at)}
        for a in allocations_result.scalars().all()
    ]
    maintenance_requests = [
        {"id": str(m.id), "status": m.status, "priority": m.priority}
        for m in maintenance_result.scalars().all()
    ]

    return AssetHistoryResponse(
        allocations=allocations,
        maintenance_requests=maintenance_requests,
    )
