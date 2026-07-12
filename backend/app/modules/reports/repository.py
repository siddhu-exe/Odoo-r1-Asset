import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import AllocationStatus, AssetStatus, BookingStatus, MaintenanceStatus, TransferStatus
from app.modules.allocations.models import Allocation, TransferRequest
from app.modules.assets.models import Asset
from app.modules.bookings.models import Booking
from app.modules.departments.models import Department
from app.modules.maintenance.models import MaintenanceRequest
from app.shared.base_repository import BaseRepository


class ReportsRepository(BaseRepository[Asset]):
    model = Asset

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_assets_count_by_status(self, status: AssetStatus) -> int:
        query = select(func.count(Asset.id)).where(Asset.status == status)
        result = await self.session.execute(query)
        return result.scalar_one() or 0

    async def get_total_assets_count(self) -> int:
        query = select(func.count(Asset.id))
        result = await self.session.execute(query)
        return result.scalar_one() or 0

    async def get_active_bookings_count(self) -> int:
        query = select(func.count(Booking.id)).where(
            Booking.status.in_([BookingStatus.UPCOMING, BookingStatus.ONGOING])
        )
        result = await self.session.execute(query)
        return result.scalar_one() or 0

    async def get_overdue_allocations_count(self) -> int:
        query = select(func.count(Allocation.id)).where(
            Allocation.status == AllocationStatus.ACTIVE,
            Allocation.expected_return_date < date.today(),
        )
        result = await self.session.execute(query)
        return result.scalar_one() or 0

    async def get_pending_maintenance_count(self) -> int:
        query = select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.status == MaintenanceStatus.PENDING
        )
        result = await self.session.execute(query)
        return result.scalar_one() or 0

    async def get_pending_transfers_count(self) -> int:
        query = select(func.count(TransferRequest.id)).where(
            TransferRequest.status == TransferStatus.PENDING
        )
        result = await self.session.execute(query)
        return result.scalar_one() or 0

    async def get_maintenance_frequency(self, limit: int = 10) -> list[tuple[uuid.UUID, str, str, int]]:
        query = (
            select(
                Asset.id,
                Asset.name,
                Asset.asset_tag,
                func.count(MaintenanceRequest.id).label("maintenance_count"),
            )
            .join(MaintenanceRequest, MaintenanceRequest.asset_id == Asset.id)
            .group_by(Asset.id, Asset.name, Asset.asset_tag)
            .order_by(func.count(MaintenanceRequest.id).desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return [(r[0], r[1], r[2], r[3]) for r in result.fetchall()]

    async def get_department_allocation_summary(self) -> list[tuple[uuid.UUID, str, int]]:
        query = (
            select(
                Department.id,
                Department.name,
                func.count(Allocation.id).label("total_allocations"),
            )
            .join(Allocation, Allocation.department_id == Department.id)
            .where(Allocation.status == AllocationStatus.ACTIVE)
            .group_by(Department.id, Department.name)
            .order_by(func.count(Allocation.id).desc())
        )
        result = await self.session.execute(query)
        return [(r[0], r[1], r[2]) for r in result.fetchall()]

    async def get_booking_heatmap(self) -> list[tuple[float, int]]:
        query = (
            select(
                func.extract("hour", Booking.start_time).label("hour"),
                func.count(Booking.id).label("booking_count"),
            )
            .where(Booking.status != BookingStatus.CANCELLED)
            .group_by(func.extract("hour", Booking.start_time))
            .order_by(func.extract("hour", Booking.start_time))
        )
        result = await self.session.execute(query)
        return [(float(r[0]), int(r[1])) for r in result.fetchall()]

    async def get_most_used_assets(self, limit: int = 10) -> list[tuple[uuid.UUID, str, str, int]]:
        query = (
            select(
                Asset.id,
                Asset.name,
                Asset.asset_tag,
                func.count(Booking.id).label("usage_count"),
            )
            .join(Booking, Booking.asset_id == Asset.id)
            .where(Booking.status != BookingStatus.CANCELLED)
            .group_by(Asset.id, Asset.name, Asset.asset_tag)
            .order_by(func.count(Booking.id).desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return [(r[0], r[1], r[2], r[3]) for r in result.fetchall()]

    async def get_idle_assets(self, limit: int = 10) -> list[tuple[uuid.UUID, str, str, float | None]]:
        last_activity = func.coalesce(
            func.max(Booking.end_time),
            func.max(Allocation.returned_at),
            Asset.created_at
        )
        query = (
            select(
                Asset.id,
                Asset.name,
                Asset.asset_tag,
                last_activity.label("last_used"),
            )
            .outerjoin(Booking, Booking.asset_id == Asset.id)
            .outerjoin(Allocation, Allocation.asset_id == Asset.id)
            .where(Asset.status == AssetStatus.AVAILABLE)
            .group_by(Asset.id, Asset.name, Asset.asset_tag, Asset.created_at)
            .order_by(last_activity.asc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return [(r[0], r[1], r[2], r[3]) for r in result.fetchall()]

    async def get_maintenance_due_assets(self) -> list[Asset]:
        query = (
            select(Asset)
            .where(Asset.next_maintenance_date.isnot(None))
            .order_by(Asset.next_maintenance_date.asc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_nearing_retirement_assets(self) -> list[Asset]:
        query = (
            select(Asset)
            .where(Asset.expected_lifespan_years.isnot(None), Asset.acquisition_date.isnot(None))
            .order_by(Asset.acquisition_date.asc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
