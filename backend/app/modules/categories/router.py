import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.enums import UserRole
from app.modules.categories import service
from app.modules.categories.schemas import (
    CategoryResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
)
from app.shared.dependencies import SessionDep, require_role
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()

AdminOnly = require_role(UserRole.ADMIN)


@router.get("", response_model=PaginatedResponse[CategoryResponse])
async def list_categories(
    session: SessionDep,
    params: Annotated[PageParams, Depends(PageParams)],
) -> PaginatedResponse[CategoryResponse]:
    return await service.list_categories(session, params)


@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(
    request: CreateCategoryRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> CategoryResponse:
    return await service.create_category(request, session)


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: uuid.UUID, session: SessionDep) -> CategoryResponse:
    return await service.get_category(category_id, session)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    request: UpdateCategoryRequest,
    session: SessionDep,
    _: Annotated[None, AdminOnly],
) -> CategoryResponse:
    return await service.update_category(category_id, request, session)
