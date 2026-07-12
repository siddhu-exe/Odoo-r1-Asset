import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import EntityStatus
from app.core.exceptions import ConflictError
from app.modules.categories.models import AssetCategory
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import (
    CategoryResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    UpdateStatusRequest,
)
from app.shared.pagination import PageParams, PaginatedResponse


async def list_categories(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[CategoryResponse]:
    repository = CategoryRepository(session)
    total = await repository.count_all()
    categories = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=categories, total=total, params=params)


async def get_category(category_id: uuid.UUID, session: AsyncSession) -> AssetCategory:
    repository = CategoryRepository(session)
    return await repository.get_by_id_or_raise(category_id)


async def create_category(
    request: CreateCategoryRequest,
    session: AsyncSession,
) -> AssetCategory:
    repository = CategoryRepository(session)

    existing = await repository.get_by_name(request.name)
    if existing is not None:
        raise ConflictError(f"A category named '{request.name}' already exists.")

    category = AssetCategory(
        name=request.name,
        description=request.description,
        custom_fields=request.custom_fields,
        status=EntityStatus.ACTIVE,
    )
    return await repository.create(category)


async def update_category(
    category_id: uuid.UUID,
    request: UpdateCategoryRequest,
    session: AsyncSession,
) -> AssetCategory:
    repository = CategoryRepository(session)
    category = await repository.get_by_id_or_raise(category_id)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(category, field, value)

    await session.flush()
    await session.refresh(category)
    return category


async def update_category_status(
    category_id: uuid.UUID,
    request: UpdateStatusRequest,
    session: AsyncSession,
) -> AssetCategory:
    repository = CategoryRepository(session)
    category = await repository.get_by_id_or_raise(category_id)
    category.status = request.status
    await session.flush()
    await session.refresh(category)
    return category
