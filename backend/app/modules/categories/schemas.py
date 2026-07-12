import uuid
from datetime import datetime

from app.core.enums import EntityStatus
from app.shared.base_schema import BaseSchema


class CategoryResponse(BaseSchema):
    id: uuid.UUID
    name: str
    description: str | None
    custom_fields: dict | None
    status: EntityStatus
    created_at: datetime
    updated_at: datetime


class CreateCategoryRequest(BaseSchema):
    name: str
    description: str | None = None
    custom_fields: dict | None = None


class UpdateCategoryRequest(BaseSchema):
    name: str | None = None
    description: str | None = None
    custom_fields: dict | None = None


class UpdateStatusRequest(BaseSchema):
    status: EntityStatus
