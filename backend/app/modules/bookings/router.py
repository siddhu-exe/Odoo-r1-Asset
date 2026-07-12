import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.bookings import service
from app.modules.bookings.schemas import (
    BookingResponse,
    CreateBookingRequest,
    ResourceAvailabilityResponse,
)
from app.shared.dependencies import CurrentEmployeeId, SessionDep
from app.shared.pagination import PageParams, PaginatedResponse


router = APIRouter()


@router.get("", response_model=PaginatedResponse[BookingResponse])
async def list_bookings(
    session: SessionDep,
    params: Annotated[PageParams, Depends(PageParams)],
) -> PaginatedResponse[BookingResponse]:
    return await service.list_bookings(session, params)


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    request: CreateBookingRequest,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> BookingResponse:
    return await service.create_booking(request, current_employee_id, session)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: uuid.UUID,
    session: SessionDep,
) -> BookingResponse:
    return await service.get_booking(booking_id, session)


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: uuid.UUID,
    session: SessionDep,
    current_employee_id: CurrentEmployeeId,
) -> BookingResponse:
    return await service.cancel_booking(booking_id, current_employee_id, session)


@router.get("/resource/{asset_id}", response_model=ResourceAvailabilityResponse)
async def get_resource_availability(
    asset_id: uuid.UUID,
    session: SessionDep,
) -> ResourceAvailabilityResponse:
    return await service.get_resource_availability(asset_id, session)
