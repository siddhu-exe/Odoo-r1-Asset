import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import BookingStatus
from app.core.exceptions import ConflictError, ForbiddenError, ValidationError
from app.modules.assets.repository import AssetRepository
from app.modules.bookings.models import Booking
from app.modules.bookings.repository import BookingRepository
from app.modules.bookings.schemas import BookingResponse, CreateBookingRequest, ResourceAvailabilityResponse
from app.shared.pagination import PageParams, PaginatedResponse


async def list_bookings(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[BookingResponse]:
    repository = BookingRepository(session)
    total = await repository.count_all()
    bookings = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=bookings, total=total, params=params)


async def create_booking(
    request: CreateBookingRequest,
    booked_by: uuid.UUID,
    session: AsyncSession,
) -> Booking:
    if request.end_time <= request.start_time:
        raise ValidationError("End time must be after start time.")

    asset_repository = AssetRepository(session)
    asset = await asset_repository.get_by_id_or_raise(request.asset_id)

    if not asset.is_bookable:
        raise ConflictError(f"Asset '{asset.name}' is not available for booking.")

    booking_repository = BookingRepository(session)
    overlapping = await booking_repository.find_overlapping_booking(
        asset_id=request.asset_id,
        start_time=request.start_time,
        end_time=request.end_time,
    )

    if overlapping is not None:
        raise ConflictError(
            f"This time slot overlaps with an existing booking "
            f"({overlapping.start_time.isoformat()} – {overlapping.end_time.isoformat()}). "
            "Please choose a different time."
        )

    booking = Booking(
        asset_id=request.asset_id,
        booked_by=booked_by,
        start_time=request.start_time,
        end_time=request.end_time,
        purpose=request.purpose,
        status=BookingStatus.UPCOMING,
    )
    return await booking_repository.create(booking)


async def get_booking(
    booking_id: uuid.UUID,
    session: AsyncSession,
) -> Booking:
    repository = BookingRepository(session)
    return await repository.get_by_id_or_raise(booking_id)


async def cancel_booking(
    booking_id: uuid.UUID,
    cancelled_by: uuid.UUID,
    session: AsyncSession,
) -> Booking:
    repository = BookingRepository(session)
    booking = await repository.get_by_id_or_raise(booking_id)

    if booking.status not in (BookingStatus.UPCOMING,):
        raise ConflictError("Only upcoming bookings can be cancelled.")

    if booking.booked_by != cancelled_by:
        raise ForbiddenError("You can only cancel your own bookings.")

    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = datetime.now(timezone.utc)

    await session.flush()
    await session.refresh(booking)
    return booking


async def get_resource_availability(
    asset_id: uuid.UUID,
    session: AsyncSession,
) -> ResourceAvailabilityResponse:
    asset_repository = AssetRepository(session)
    await asset_repository.get_by_id_or_raise(asset_id)

    booking_repository = BookingRepository(session)
    bookings = await booking_repository.list_for_asset(asset_id)

    return ResourceAvailabilityResponse(asset_id=asset_id, bookings=bookings)
