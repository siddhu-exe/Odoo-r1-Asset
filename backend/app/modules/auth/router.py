from fastapi import APIRouter

from app.modules.auth import service
from app.modules.auth.schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.shared.dependencies import SessionDep


router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(request: RegisterRequest, session: SessionDep) -> TokenResponse:
    return await service.register_employee(request, session)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, session: SessionDep) -> TokenResponse:
    return await service.login(request, session)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest) -> TokenResponse:
    return await service.refresh_tokens(request.refresh_token)
