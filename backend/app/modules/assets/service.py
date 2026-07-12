import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.modules.allocations.repository import AllocationRepository
from app.modules.assets.models import Asset
from app.modules.assets.repository import AssetFilterParams, AssetRepository
from app.modules.assets.schemas import (
    AllocationHistoryEntry,
    AssetHistoryResponse,
    AssetResponse,
    CreateAssetRequest,
    MaintenanceHistoryEntry,
    UpdateAssetRequest,
)
from app.modules.categories.repository import CategoryRepository
from app.modules.maintenance.repository import MaintenanceRepository
from app.shared.pagination import PageParams, PaginatedResponse


def _to_asset_response(asset: Asset) -> AssetResponse:
    return AssetResponse(
        id=asset.id,
        name=asset.name,
        asset_tag=asset.asset_tag,
        serial_number=asset.serial_number,
        category_id=asset.category_id,
        category_name=asset.category.name if asset.category else None,
        condition=asset.condition,
        status=asset.status,
        location=asset.location,
        is_bookable=asset.is_bookable,
        acquisition_date=asset.acquisition_date,
        acquisition_cost=asset.acquisition_cost,
        photo_url=asset.photo_url,
        document_url=asset.document_url,
        notes=asset.notes,
        next_maintenance_date=asset.next_maintenance_date,
        expected_lifespan_years=asset.expected_lifespan_years,
        created_at=asset.created_at,
        updated_at=asset.updated_at,
    )


async def list_assets(
    session: AsyncSession,
    params: PageParams,
    filters: AssetFilterParams,
) -> PaginatedResponse[AssetResponse]:
    repository = AssetRepository(session)
    total = await repository.count_filtered(filters)
    assets = await repository.list_filtered(filters, offset=params.offset, limit=params.page_size)
    items = [_to_asset_response(a) for a in assets]
    return PaginatedResponse.build(items=items, total=total, params=params)


async def get_asset(asset_id: uuid.UUID, session: AsyncSession) -> AssetResponse:
    repository = AssetRepository(session)
    asset = await repository.get_with_category(asset_id)
    if asset is None:
        raise NotFoundError("Asset", asset_id)
    return _to_asset_response(asset)


async def create_asset(
    request: CreateAssetRequest,
    session: AsyncSession,
) -> AssetResponse:
    category_repository = CategoryRepository(session)
    await category_repository.get_by_id_or_raise(request.category_id)

    asset_repository = AssetRepository(session)

    if request.serial_number:
        existing = await asset_repository.get_by_serial_number(request.serial_number)
        if existing is not None:
            raise ConflictError(
                f"An asset with serial number '{request.serial_number}' already exists."
            )

    asset_tag = await asset_repository.next_asset_tag()

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
        next_maintenance_date=request.next_maintenance_date,
        expected_lifespan_years=request.expected_lifespan_years,
    )
    await asset_repository.create(asset)

    created = await asset_repository.get_with_category(asset.id)
    if created is None:
        raise NotFoundError("Asset", asset.id)
    return _to_asset_response(created)


async def update_asset(
    asset_id: uuid.UUID,
    request: UpdateAssetRequest,
    session: AsyncSession,
) -> AssetResponse:
    repository = AssetRepository(session)
    asset = await repository.get_by_id_or_raise(asset_id)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)

    await session.flush()
    updated = await repository.get_with_category(asset_id)
    if updated is None:
        raise NotFoundError("Asset", asset_id)
    return _to_asset_response(updated)


async def get_asset_history(
    asset_id: uuid.UUID,
    session: AsyncSession,
) -> AssetHistoryResponse:
    asset_repository = AssetRepository(session)
    await asset_repository.get_by_id_or_raise(asset_id)

    allocation_repository = AllocationRepository(session)
    maintenance_repository = MaintenanceRepository(session)

    raw_allocations = await allocation_repository.list_for_asset(asset_id)
    raw_maintenance = await maintenance_repository.list_for_asset(asset_id)

    allocations = [
        AllocationHistoryEntry(
            id=a.id,
            status=a.status,
            allocated_at=a.created_at,
            returned_at=a.returned_at,
        )
        for a in raw_allocations
    ]
    maintenance_requests = [
        MaintenanceHistoryEntry(
            id=m.id,
            status=m.status,
            priority=m.priority,
            description=m.description,
            raised_at=m.created_at,
        )
        for m in raw_maintenance
    ]

    return AssetHistoryResponse(
        allocations=allocations,
        maintenance_requests=maintenance_requests,
    )