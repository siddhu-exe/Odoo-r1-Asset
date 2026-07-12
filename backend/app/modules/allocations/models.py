import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import AllocationStatus, TransferStatus
from app.shared.base_model import TimestampedModel


if TYPE_CHECKING:
    from app.modules.assets.models import Asset
    from app.modules.employees.models import Employee


class Allocation(TimestampedModel):
    __tablename__ = "allocations"

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    employee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )

    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
    )

    allocated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    status: Mapped[AllocationStatus] = mapped_column(
        String(20), nullable=False, default=AllocationStatus.ACTIVE
    )

    expected_return_date: Mapped[date | None] = mapped_column(nullable=True)
    returned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    condition_on_return: Mapped[str | None] = mapped_column(String(20), nullable=True)
    return_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    return_approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )

    asset: Mapped["Asset"] = relationship("Asset", foreign_keys=[asset_id])
    employee: Mapped["Employee | None"] = relationship(
        "Employee", foreign_keys=[employee_id]
    )
    allocated_by_employee: Mapped["Employee"] = relationship(
        "Employee", foreign_keys=[allocated_by]
    )


class TransferRequest(TimestampedModel):
    __tablename__ = "transfer_requests"

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    from_employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    to_employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    requested_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )

    status: Mapped[TransferStatus] = mapped_column(
        String(20), nullable=False, default=TransferStatus.PENDING
    )

    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset: Mapped["Asset"] = relationship("Asset", foreign_keys=[asset_id])
    from_employee: Mapped["Employee"] = relationship(
        "Employee", foreign_keys=[from_employee_id]
    )
    to_employee: Mapped["Employee"] = relationship(
        "Employee", foreign_keys=[to_employee_id]
    )
