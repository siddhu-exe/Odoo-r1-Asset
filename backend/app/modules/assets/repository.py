import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.enums import AssetStatus
from app.modules.assets.models import Asset
from app.shared.base_repository import BaseRepository


class AssetFilterParams:
    def __init__(
        self,
        search: str | None = None,
        status: AssetStatus | None = None,
        category_id: uuid.UUID | None = None,
        is_bookable: bool | None = None,
    ) -> None:
        self.search = search
        self.status = status
        self.category_id = category_id
        self.is_bookable = is_bookable


class AssetRepository(BaseRepository[Asset]):
    model = Asset

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    def _apply_filters(self, query, filters: AssetFilterParams):
        if filters.search:
            term = f"%{filters.search.lower()}%"
            query = query.where(
                or_(
                    func.lower(Asset.name).like(term),
                    func.lower(Asset.asset_tag).like(term),
                    func.lower(Asset.serial_number).like(term),
                    func.lower(Asset.location).like(term),
                )
            )
        if filters.status is not None:
            query = query.where(Asset.status == filters.status)
        if filters.category_id is not None:
            query = query.where(Asset.category_id == filters.category_id)
        if filters.is_bookable is not None:
            query = query.where(Asset.is_bookable == filters.is_bookable)
        return query

    async def list_filtered(
        self,
        filters: AssetFilterParams,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Asset]:
        query = select(Asset).options(selectinload(Asset.category))
        query = self._apply_filters(query, filters)
        query = query.offset(offset).limit(limit).order_by(Asset.created_at.desc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_filtered(self, filters: AssetFilterParams) -> int:
        query = select(func.count()).select_from(Asset)
        query = self._apply_filters(query, filters)
        result = await self.session.execute(query)
        return result.scalar_one()

    async def get_with_category(self, asset_id: uuid.UUID) -> Asset | None:
        result = await self.session.execute(
            select(Asset)
            .options(selectinload(Asset.category))
            .where(Asset.id == asset_id)
        )
        return result.scalar_one_or_none()

    async def get_by_asset_tag(self, asset_tag: str) -> Asset | None:
        result = await self.session.execute(
            select(Asset).where(Asset.asset_tag == asset_tag)
        )
        return result.scalar_one_or_none()

    async def get_by_serial_number(self, serial_number: str) -> Asset | None:
        result = await self.session.execute(
            select(Asset).where(Asset.serial_number == serial_number)
        )
        return result.scalar_one_or_none()

    async def next_asset_tag(self) -> str:
        result = await self.session.execute(select(func.count()).select_from(Asset))
        count = result.scalar_one()
        sequence = count + 1
        candidate = f"AF-{sequence:04d}"
        while await self.get_by_asset_tag(candidate) is not None:
            sequence += 1
            candidate = f"AF-{sequence:04d}"
        return candidate
