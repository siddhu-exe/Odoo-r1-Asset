import uuid

from pydantic import field_validator

from app.core.enums import UserRole
from app.shared.base_schema import BaseSchema


class RegisterRequest(BaseSchema):
    email: str
    password: str
    first_name: str
    last_name: str
    phone: str | None = None

    @field_validator("email")
    @classmethod
    def normalise_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Enter a valid email address.")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value


class LoginRequest(BaseSchema):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalise_email(cls, value: str) -> str:
        return value.strip().lower()


class RefreshRequest(BaseSchema):
    refresh_token: str


class ForgotPasswordRequest(BaseSchema):
    email: str

    @field_validator("email")
    @classmethod
    def normalise_email(cls, value: str) -> str:
        return value.strip().lower()


class ResetPasswordRequest(BaseSchema):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value


class ChangePasswordRequest(BaseSchema):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value


class AuthUserResponse(BaseSchema):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    role: UserRole
    department_id: uuid.UUID | None


class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class ForgotPasswordResponse(BaseSchema):
    reset_token: str | None
    message: str
