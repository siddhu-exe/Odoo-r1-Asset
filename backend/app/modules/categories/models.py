from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import EntityStatus
from app.shared.base_model import TimestampedModel


class AssetCategory(TimestampedModel):
    __tablename__ = "asset_categories"

    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    custom_fields: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    status: Mapped[EntityStatus] = mapped_column(
        String(20), nullable=False, default=EntityStatus.ACTIVE
    )
