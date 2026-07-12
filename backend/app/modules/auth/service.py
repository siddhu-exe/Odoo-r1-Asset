from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import EntityStatus, UserRole
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.modules.employees.models import Employee


async def register_employee(request: RegisterRequest, session: AsyncSession) -> TokenResponse:
    existing = await session.execute(
        select(Employee).where(Employee.email == request.email)
    )
    if existing.scalar_one_or_none() is not None:
        raise ConflictError(f"An account with email '{request.email}' already exists.")

    employee = Employee(
        email=request.email,
        hashed_password=hash_password(request.password),
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone,
        role=UserRole.EMPLOYEE,
        status=EntityStatus.ACTIVE,
    )
    session.add(employee)
    await session.flush()
    await session.refresh(employee)

    return TokenResponse(
        access_token=create_access_token(employee.id),
        refresh_token=create_refresh_token(employee.id),
    )


async def login(request: LoginRequest, session: AsyncSession) -> TokenResponse:
    result = await session.execute(
        select(Employee).where(Employee.email == request.email)
    )
    employee = result.scalar_one_or_none()

    if employee is None or not verify_password(request.password, employee.hashed_password):
        raise UnauthorizedError("Invalid email or password.")

    if employee.status != EntityStatus.ACTIVE:
        raise UnauthorizedError("Your account has been deactivated.")

    return TokenResponse(
        access_token=create_access_token(employee.id),
        refresh_token=create_refresh_token(employee.id),
    )


async def refresh_tokens(refresh_token: str) -> TokenResponse:
    try:
        employee_id = decode_token(refresh_token)
    except ValueError as error:
        raise UnauthorizedError("Refresh token is invalid or expired.") from error

    return TokenResponse(
        access_token=create_access_token(employee_id),
        refresh_token=create_refresh_token(employee_id),
    )
