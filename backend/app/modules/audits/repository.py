import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.audits.models import AuditAssignment, AuditCycle, AuditItem
from app.shared.base_repository import BaseRepository


class AuditCycleRepository(BaseRepository[AuditCycle]):
    model = AuditCycle

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class AuditItemRepository(BaseRepository[AuditItem]):
    model = AuditItem

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_for_cycle(self, cycle_id: uuid.UUID) -> list[AuditItem]:
        result = await self.session.execute(
            select(AuditItem).where(AuditItem.cycle_id == cycle_id)
        )
        return list(result.scalars().all())


class AuditAssignmentRepository(BaseRepository[AuditAssignment]):
    model = AuditAssignment

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
