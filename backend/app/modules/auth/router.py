from fastapi import APIRouter

from app.modules.auth import service
from app.modules.auth.schemas import (
    AuthResponse,
    AuthUserResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.shared.dependencies import CurrentEmployeeId, SessionDep


router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(request: RegisterRequest, session: SessionDep) -> AuthResponse:
    return await service.register_employee(request, session)


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, session: SessionDep) -> AuthResponse:
    return await service.login(request, session)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest, session: SessionDep) -> TokenResponse:
    return await service.refresh_tokens(request.refresh_token, session)


@router.get("/me", response_model=AuthUserResponse)
async def get_me(session: SessionDep, current_employee_id: CurrentEmployeeId) -> AuthUserResponse:
    employee = await service.get_current_employee(current_employee_id, session)
    return AuthUserResponse.model_validate(employee)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request: ForgotPasswordRequest, session: SessionDep
) -> ForgotPasswordResponse:
    return await service.forgot_password(request, session)


@router.post("/reset-password", status_code=204)
async def reset_password(request: ResetPasswordRequest, session: SessionDep) -> None:
    await service.reset_password(request, session)


@router.post("/change-password", status_code=204)
async def change_password(
    request: ChangePasswordRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> None:
    await service.change_password(current_employee_id, request, session)
