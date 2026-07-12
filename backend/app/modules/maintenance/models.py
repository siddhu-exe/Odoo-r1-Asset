import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import MaintenancePriority, MaintenanceStatus
from app.shared.base_model import TimestampedModel


if TYPE_CHECKING:
    from app.modules.assets.models import Asset
    from app.modules.employees.models import Employee


class MaintenanceRequest(TimestampedModel):
    __tablename__ = "maintenance_requests"

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    raised_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(Text, nullable=False)

    priority: Mapped[MaintenancePriority] = mapped_column(
        String(20), nullable=False, default=MaintenancePriority.MEDIUM
    )

    status: Mapped[MaintenanceStatus] = mapped_column(
        String(30), nullable=False, default=MaintenanceStatus.PENDING, index=True
    )

    technician_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )

    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )

    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset: Mapped["Asset"] = relationship("Asset", foreign_keys=[asset_id])
    raiser: Mapped["Employee"] = relationship("Employee", foreign_keys=[raised_by])
    technician: Mapped["Employee | None"] = relationship(
        "Employee", foreign_keys=[technician_id]
    )
    approver: Mapped["Employee | None"] = relationship(
        "Employee", foreign_keys=[approved_by]
    )
