import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.enums import AllocationStatus
from app.modules.allocations.models import Allocation, TransferRequest
from app.shared.base_repository import BaseRepository


class AllocationRepository(BaseRepository[Allocation]):
    model = Allocation

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_active_allocation_for_asset(self, asset_id: uuid.UUID) -> Allocation | None:
        result = await self.session.execute(
            select(Allocation)
            .options(joinedload(Allocation.employee))
            .where(
                Allocation.asset_id == asset_id,
                Allocation.status == AllocationStatus.ACTIVE,
            )
        )
        return result.scalar_one_or_none()

    async def list_overdue(self) -> list[Allocation]:
        from datetime import date

        result = await self.session.execute(
            select(Allocation).where(
                Allocation.status == AllocationStatus.ACTIVE,
                Allocation.expected_return_date < date.today(),
            )
        )
        return list(result.scalars().all())


class TransferRequestRepository(BaseRepository[TransferRequest]):
    model = TransferRequest

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
