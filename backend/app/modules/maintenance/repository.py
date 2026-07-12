from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.maintenance.models import MaintenanceRequest
from app.shared.base_repository import BaseRepository


class MaintenanceRepository(BaseRepository[MaintenanceRequest]):
    model = MaintenanceRequest

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
