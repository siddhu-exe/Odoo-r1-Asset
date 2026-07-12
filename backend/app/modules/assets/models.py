import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import AssetCondition, AssetStatus
from app.shared.base_model import TimestampedModel


if TYPE_CHECKING:
    from app.modules.categories.models import AssetCategory


class Asset(TimestampedModel):
    __tablename__ = "assets"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    asset_tag: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    serial_number: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("asset_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )

    condition: Mapped[AssetCondition] = mapped_column(
        String(20), nullable=False, default=AssetCondition.GOOD
    )

    status: Mapped[AssetStatus] = mapped_column(
        String(30), nullable=False, default=AssetStatus.AVAILABLE, index=True
    )

    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_bookable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    acquisition_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    acquisition_cost: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=12, scale=2), nullable=True
    )

    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    next_maintenance_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expected_lifespan_years: Mapped[int | None] = mapped_column(Integer, nullable=True)

    category: Mapped["AssetCategory"] = relationship("AssetCategory")
