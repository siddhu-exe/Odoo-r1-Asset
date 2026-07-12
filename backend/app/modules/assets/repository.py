from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.assets.models import Asset
from app.shared.base_repository import BaseRepository


class AssetRepository(BaseRepository[Asset]):
    model = Asset

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

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
        result = await self.session.execute(
            select(func.count()).select_from(Asset)
        )
        count = result.scalar_one()
        sequence = count + 1
        return f"AF-{sequence:04d}"
