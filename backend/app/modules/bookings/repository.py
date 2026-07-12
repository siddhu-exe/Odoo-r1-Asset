import uuid
from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import BookingStatus
from app.modules.bookings.models import Booking
from app.shared.base_repository import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    model = Booking

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def find_overlapping_booking(
        self,
        asset_id: uuid.UUID,
        start_time: datetime,
        end_time: datetime,
        exclude_booking_id: uuid.UUID | None = None,
    ) -> Booking | None:
        conditions = [
            Booking.asset_id == asset_id,
            Booking.status.in_([BookingStatus.UPCOMING, BookingStatus.ONGOING]),
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        ]

        if exclude_booking_id is not None:
            conditions.append(Booking.id != exclude_booking_id)

        result = await self.session.execute(
            select(Booking).where(and_(*conditions)).limit(1)
        )
        return result.scalar_one_or_none()

    async def list_for_asset(self, asset_id: uuid.UUID) -> list[Booking]:
        result = await self.session.execute(
            select(Booking)
            .where(Booking.asset_id == asset_id)
            .order_by(Booking.start_time)
        )
        return list(result.scalars().all())
