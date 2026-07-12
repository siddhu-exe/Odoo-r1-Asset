import uuid
from datetime import date, datetime

from app.core.enums import AllocationStatus, TransferStatus
from app.shared.base_schema import BaseSchema


class AllocationResponse(BaseSchema):
    id: uuid.UUID
    asset_id: uuid.UUID
    employee_id: uuid.UUID | None
    department_id: uuid.UUID | None
    allocated_by: uuid.UUID
    status: AllocationStatus
    expected_return_date: date | None
    returned_at: datetime | None
    condition_on_return: str | None
    return_notes: str | None
    created_at: datetime
    updated_at: datetime


class CreateAllocationRequest(BaseSchema):
    asset_id: uuid.UUID
    employee_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    expected_return_date: date | None = None
    notes: str | None = None


class ReturnAssetRequest(BaseSchema):
    condition_on_return: str
    return_notes: str | None = None


class TransferRequestResponse(BaseSchema):
    id: uuid.UUID
    asset_id: uuid.UUID
    from_employee_id: uuid.UUID
    to_employee_id: uuid.UUID
    requested_by: uuid.UUID
    approved_by: uuid.UUID | None
    status: TransferStatus
    reason: str | None
    rejection_notes: str | None
    created_at: datetime
    updated_at: datetime


class CreateTransferRequest(BaseSchema):
    asset_id: uuid.UUID
    to_employee_id: uuid.UUID
    reason: str | None = None


class RejectTransferRequest(BaseSchema):
    rejection_notes: str
