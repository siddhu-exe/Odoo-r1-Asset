import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import AuditItemStatus, AuditStatus
from app.shared.base_model import TimestampedModel


if TYPE_CHECKING:
    from app.modules.assets.models import Asset
    from app.modules.departments.models import Department
    from app.modules.employees.models import Employee


class AuditCycle(TimestampedModel):
    __tablename__ = "audit_cycles"

    name: Mapped[str] = mapped_column(String(200), nullable=False)

    scope_department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
    )

    scope_location: Mapped[str | None] = mapped_column(String(200), nullable=True)

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    status: Mapped[AuditStatus] = mapped_column(
        String(20), nullable=False, default=AuditStatus.OPEN
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    scope_department: Mapped["Department | None"] = relationship(
        "Department", foreign_keys=[scope_department_id]
    )

    creator: Mapped["Employee"] = relationship("Employee", foreign_keys=[created_by])
    assignments: Mapped[list["AuditAssignment"]] = relationship(
        "AuditAssignment", back_populates="cycle"
    )
    items: Mapped[list["AuditItem"]] = relationship("AuditItem", back_populates="cycle")


class AuditAssignment(TimestampedModel):
    __tablename__ = "audit_assignments"

    cycle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_cycles.id", ondelete="CASCADE"),
        nullable=False,
    )

    auditor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=False,
    )

    cycle: Mapped["AuditCycle"] = relationship("AuditCycle", back_populates="assignments")
    auditor: Mapped["Employee"] = relationship("Employee", foreign_keys=[auditor_id])


class AuditItem(TimestampedModel):
    __tablename__ = "audit_items"

    cycle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_cycles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="RESTRICT"),
        nullable=False,
    )

    auditor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )

    status: Mapped[AuditItemStatus] = mapped_column(
        String(20), nullable=False, default=AuditItemStatus.PENDING
    )

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    cycle: Mapped["AuditCycle"] = relationship("AuditCycle", back_populates="items")
    asset: Mapped["Asset"] = relationship("Asset", foreign_keys=[asset_id])
    auditor: Mapped["Employee | None"] = relationship(
        "Employee", foreign_keys=[auditor_id]
    )
