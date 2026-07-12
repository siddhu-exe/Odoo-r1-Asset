import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import EntityStatus, UserRole
from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_password_reset_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.modules.auth.schemas import (
    AuthResponse,
    AuthUserResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.modules.employees.models import Employee
from app.modules.employees.repository import EmployeeRepository


def _build_auth_response(employee: Employee, access_token: str, refresh_token: str) -> AuthResponse:
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=AuthUserResponse(
            id=employee.id,
            email=employee.email,
            first_name=employee.first_name,
            last_name=employee.last_name,
            role=employee.role,
            department_id=employee.department_id,
        ),
    )


async def register_employee(request: RegisterRequest, session: AsyncSession) -> AuthResponse:
    repository = EmployeeRepository(session)

    existing = await repository.get_by_email(request.email)
    if existing is not None:
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
    created = await repository.create(employee)

    return _build_auth_response(
        created,
        access_token=create_access_token(created.id),
        refresh_token=create_refresh_token(created.id),
    )


async def login(request: LoginRequest, session: AsyncSession) -> AuthResponse:
    repository = EmployeeRepository(session)
    employee = await repository.get_by_email(request.email)

    if employee is None or not verify_password(request.password, employee.hashed_password):
        raise UnauthorizedError("Invalid email or password.")

    if employee.status != EntityStatus.ACTIVE:
        raise UnauthorizedError("Your account has been deactivated.")

    return _build_auth_response(
        employee,
        access_token=create_access_token(employee.id),
        refresh_token=create_refresh_token(employee.id),
    )


# Re-validates that the employee account is still active before issuing new tokens.
async def refresh_tokens(refresh_token: str, session: AsyncSession) -> TokenResponse:
    try:
        employee_id = decode_refresh_token(refresh_token)
    except ValueError as error:
        raise UnauthorizedError("Refresh token is invalid or expired.") from error

    repository = EmployeeRepository(session)
    employee = await repository.get_by_id(employee_id)

    if employee is None or employee.status != EntityStatus.ACTIVE:
        raise UnauthorizedError("Account is inactive or no longer exists.")

    return TokenResponse(
        access_token=create_access_token(employee_id),
        refresh_token=create_refresh_token(employee_id),
    )


async def get_current_employee(employee_id: uuid.UUID, session: AsyncSession) -> Employee:
    repository = EmployeeRepository(session)
    employee = await repository.get_by_id(employee_id)
    if employee is None:
        raise UnauthorizedError("Account no longer exists.")
    return employee


# Returns the reset token in the response body for demo purposes; a production system would email it.
async def forgot_password(
    request: ForgotPasswordRequest, session: AsyncSession
) -> ForgotPasswordResponse:
    repository = EmployeeRepository(session)
    employee = await repository.get_by_email(request.email)

    if employee is None:
        return ForgotPasswordResponse(
            reset_token=None,
            message="If an account with that email exists, a reset token has been generated.",
        )

    reset_token = create_password_reset_token(employee.email)
    return ForgotPasswordResponse(
        reset_token=reset_token,
        message="Use this token at POST /auth/reset-password to set a new password.",
    )


async def reset_password(request: ResetPasswordRequest, session: AsyncSession) -> None:
    try:
        email = decode_password_reset_token(request.token)
    except ValueError as error:
        raise UnauthorizedError("Password reset token is invalid or expired.") from error

    repository = EmployeeRepository(session)
    employee = await repository.get_by_email(email)

    if employee is None:
        raise NotFoundError("Employee", email)

    employee.hashed_password = hash_password(request.new_password)
    await session.flush()


async def change_password(
    employee_id: uuid.UUID,
    request: ChangePasswordRequest,
    session: AsyncSession,
) -> None:
    repository = EmployeeRepository(session)
    employee = await repository.get_by_id_or_raise(employee_id)

    if not verify_password(request.current_password, employee.hashed_password):
        raise UnauthorizedError("Current password is incorrect.")

    employee.hashed_password = hash_password(request.new_password)
    await session.flush()
