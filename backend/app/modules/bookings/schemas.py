import uuid
from datetime import datetime

from app.core.enums import BookingStatus
from app.shared.base_schema import BaseSchema


class BookingResponse(BaseSchema):
    id: uuid.UUID
    asset_id: uuid.UUID
    booked_by: uuid.UUID
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    purpose: str | None
    cancelled_at: datetime | None
    created_at: datetime
    updated_at: datetime


class CreateBookingRequest(BaseSchema):
    asset_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    purpose: str | None = None


class ResourceAvailabilityResponse(BaseSchema):
    asset_id: uuid.UUID
    bookings: list[BookingResponse]
