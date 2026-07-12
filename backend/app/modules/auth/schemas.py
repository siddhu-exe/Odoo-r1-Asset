from app.shared.base_schema import BaseSchema


class LoginRequest(BaseSchema):
    email: str
    password: str


class RegisterRequest(BaseSchema):
    email: str
    password: str
    first_name: str
    last_name: str
    phone: str | None = None


class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseSchema):
    refresh_token: str
