import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.maintenance.models import MaintenanceRequest
from app.shared.base_repository import BaseRepository


class MaintenanceRepository(BaseRepository[MaintenanceRequest]):
    model = MaintenanceRequest

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_for_asset(self, asset_id: uuid.UUID) -> list[MaintenanceRequest]:
        result = await self.session.execute(
            select(MaintenanceRequest)
            .where(MaintenanceRequest.asset_id == asset_id)
            .order_by(MaintenanceRequest.created_at.desc())
        )
        return list(result.scalars().all())
