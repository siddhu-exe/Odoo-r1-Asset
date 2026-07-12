import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import EntityStatus
from app.shared.base_model import TimestampedModel


if TYPE_CHECKING:
    from app.modules.employees.models import Employee


class Department(TimestampedModel):
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    status: Mapped[EntityStatus] = mapped_column(
        String(20), nullable=False, default=EntityStatus.ACTIVE
    )

    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
    )

    head_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL", use_alter=True, name="fk_department_head_id"),
        nullable=True,
    )

    parent: Mapped["Department | None"] = relationship(
        "Department", remote_side="Department.id", back_populates="children"
    )

    children: Mapped[list["Department"]] = relationship(
        "Department", back_populates="parent"
    )

    head: Mapped["Employee | None"] = relationship(
        "Employee", foreign_keys=[head_id]
    )

    members: Mapped[list["Employee"]] = relationship(
        "Employee", foreign_keys="Employee.department_id", back_populates="department"
    )
