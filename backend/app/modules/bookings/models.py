import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import BookingStatus
from app.shared.base_model import TimestampedModel


if TYPE_CHECKING:
    from app.modules.assets.models import Asset
    from app.modules.employees.models import Employee


class Booking(TimestampedModel):
    __tablename__ = "bookings"

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    booked_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    status: Mapped[BookingStatus] = mapped_column(
        String(20), nullable=False, default=BookingStatus.UPCOMING, index=True
    )

    purpose: Mapped[str | None] = mapped_column(Text, nullable=True)

    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    asset: Mapped["Asset"] = relationship("Asset", foreign_keys=[asset_id])
    employee: Mapped["Employee"] = relationship("Employee", foreign_keys=[booked_by])
