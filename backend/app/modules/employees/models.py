import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import EntityStatus, UserRole
from app.shared.base_model import TimestampedModel


if TYPE_CHECKING:
    from app.modules.departments.models import Department


class Employee(TimestampedModel):
    __tablename__ = "employees"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    role: Mapped[UserRole] = mapped_column(
        String(30), nullable=False, default=UserRole.EMPLOYEE
    )

    status: Mapped[EntityStatus] = mapped_column(
        String(20), nullable=False, default=EntityStatus.ACTIVE
    )

    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
    )

    fcm_token: Mapped[str | None] = mapped_column(String(500), nullable=True)

    department: Mapped["Department | None"] = relationship(
        "Department", foreign_keys=[department_id], back_populates="members"
    )
