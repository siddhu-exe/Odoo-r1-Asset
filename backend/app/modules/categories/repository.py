from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.categories.models import AssetCategory
from app.shared.base_repository import BaseRepository


class CategoryRepository(BaseRepository[AssetCategory]):
    model = AssetCategory

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_name(self, name: str) -> AssetCategory | None:
        result = await self.session.execute(
            select(AssetCategory).where(AssetCategory.name == name)
        )
        return result.scalar_one_or_none()
