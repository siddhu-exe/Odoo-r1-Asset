import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.employees.models import Employee
from app.shared.base_repository import BaseRepository


class EmployeeRepository(BaseRepository[Employee]):
    model = Employee

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_email(self, email: str) -> Employee | None:
        result = await self.session.execute(
            select(Employee).where(Employee.email == email)
        )
        return result.scalar_one_or_none()

    async def list_by_department(self, department_id: uuid.UUID) -> list[Employee]:
        result = await self.session.execute(
            select(Employee).where(Employee.department_id == department_id)
        )
        return list(result.scalars().all())
