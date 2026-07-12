import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.core.enums import AssetStatus, UserRole
from app.modules.assets import service
from app.modules.assets.repository import AssetFilterParams
from app.modules.assets.schemas import (
    AssetHistoryResponse,
    AssetResponse,
    CreateAssetRequest,
    UpdateAssetRequest,
)
from app.shared.dependencies import SessionDep, require_role
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()

AssetManagerOnly = require_role(UserRole.ASSET_MANAGER, UserRole.ADMIN)


@router.get("", response_model=PaginatedResponse[AssetResponse])
async def list_assets(
    session: SessionDep,
    params: Annotated[PageParams, Depends(PageParams)],
    search: str | None = Query(default=None, description="Search by name, tag, serial, or location"),
    status: AssetStatus | None = Query(default=None),
    category_id: uuid.UUID | None = Query(default=None),
    is_bookable: bool | None = Query(default=None),
) -> PaginatedResponse[AssetResponse]:
    filters = AssetFilterParams(
        search=search,
        status=status,
        category_id=category_id,
        is_bookable=is_bookable,
    )
    return await service.list_assets(session, params, filters)


@router.post("", response_model=AssetResponse, status_code=201)
async def create_asset(
    request: CreateAssetRequest,
    session: SessionDep,
    _: Annotated[None, AssetManagerOnly],
) -> AssetResponse:
    return await service.create_asset(request, session)


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: uuid.UUID, session: SessionDep) -> AssetResponse:
    return await service.get_asset(asset_id, session)


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: uuid.UUID,
    request: UpdateAssetRequest,
    session: SessionDep,
    _: Annotated[None, AssetManagerOnly],
) -> AssetResponse:
    return await service.update_asset(asset_id, request, session)


@router.get("/{asset_id}/history", response_model=AssetHistoryResponse)
async def get_asset_history(
    asset_id: uuid.UUID,
    session: SessionDep,
) -> AssetHistoryResponse:
    return await service.get_asset_history(asset_id, session)
