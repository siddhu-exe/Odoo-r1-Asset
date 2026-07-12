import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import EntityStatus, UserRole
from app.core.exceptions import ConflictError, ForbiddenError
from app.core.security import hash_password
from app.modules.employees.models import Employee
from app.modules.employees.repository import EmployeeRepository
from app.modules.employees.schemas import (
    CreateEmployeeRequest,
    EmployeeResponse,
    UpdateEmployeeRequest,
    UpdateRoleRequest,
    UpdateStatusRequest,
)
from app.shared.pagination import PageParams, PaginatedResponse


async def list_employees(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[EmployeeResponse]:
    repository = EmployeeRepository(session)
    total = await repository.count_all()
    employees = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=employees, total=total, params=params)


async def get_employee(employee_id: uuid.UUID, session: AsyncSession) -> Employee:
    repository = EmployeeRepository(session)
    return await repository.get_by_id_or_raise(employee_id)


async def create_employee(
    request: CreateEmployeeRequest,
    session: AsyncSession,
) -> Employee:
    repository = EmployeeRepository(session)

    existing = await repository.get_by_email(request.email)
    if existing is not None:
        raise ConflictError(f"An employee with email '{request.email}' already exists.")

    employee = Employee(
        email=request.email,
        hashed_password=hash_password(request.password),
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone,
        department_id=request.department_id,
        role=UserRole.EMPLOYEE,
        status=EntityStatus.ACTIVE,
    )
    return await repository.create(employee)


async def update_employee(
    employee_id: uuid.UUID,
    request: UpdateEmployeeRequest,
    session: AsyncSession,
) -> Employee:
    repository = EmployeeRepository(session)
    employee = await repository.get_by_id_or_raise(employee_id)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)

    await session.flush()
    await session.refresh(employee)
    return employee


async def update_employee_role(
    employee_id: uuid.UUID,
    request: UpdateRoleRequest,
    current_employee_id: uuid.UUID,
    session: AsyncSession,
) -> Employee:
    if employee_id == current_employee_id:
        raise ForbiddenError("You cannot change your own role.")

    repository = EmployeeRepository(session)
    employee = await repository.get_by_id_or_raise(employee_id)
    employee.role = request.role

    await session.flush()
    await session.refresh(employee)
    return employee


async def update_employee_status(
    employee_id: uuid.UUID,
    request: UpdateStatusRequest,
    current_employee_id: uuid.UUID,
    session: AsyncSession,
) -> Employee:
    if employee_id == current_employee_id:
        raise ForbiddenError("You cannot change your own status.")

    repository = EmployeeRepository(session)
    employee = await repository.get_by_id_or_raise(employee_id)
    employee.status = request.status

    await session.flush()
    await session.refresh(employee)
    return employee
