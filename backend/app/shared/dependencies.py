from collections.abc import AsyncGenerator
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.enums import UserRole
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token


bearer_scheme = HTTPBearer()

SessionDep = Annotated[AsyncSession, Depends(get_db)]
CredentialsDep = Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]


async def get_current_employee_id(
    credentials: CredentialsDep,
) -> UUID:
    try:
        return decode_token(credentials.credentials)
    except ValueError as error:
        raise UnauthorizedError() from error


CurrentEmployeeId = Annotated[UUID, Depends(get_current_employee_id)]


def require_role(*allowed_roles: UserRole):
    async def role_guard(
        session: SessionDep,
        employee_id: CurrentEmployeeId,
    ) -> None:
        from sqlalchemy import select

        from app.modules.employees.models import Employee

        result = await session.execute(
            select(Employee).where(Employee.id == employee_id)
        )
        employee = result.scalar_one_or_none()

        if employee is None:
            raise UnauthorizedError()

        if employee.role not in allowed_roles:
            raise ForbiddenError()

    return Depends(role_guard)
