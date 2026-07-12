from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.departments.models import Department
from app.shared.base_repository import BaseRepository


class DepartmentRepository(BaseRepository[Department]):
    model = Department

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_code(self, code: str) -> Department | None:
        result = await self.session.execute(
            select(Department).where(Department.code == code)
        )
        return result.scalar_one_or_none()
