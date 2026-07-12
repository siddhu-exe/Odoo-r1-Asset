import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import EntityStatus
from app.core.exceptions import ConflictError
from app.modules.departments.models import Department
from app.modules.departments.repository import DepartmentRepository
from app.modules.departments.schemas import (
    CreateDepartmentRequest,
    DepartmentResponse,
    UpdateDepartmentRequest,
    UpdateStatusRequest,
)
from app.shared.pagination import PageParams, PaginatedResponse


async def list_departments(
    session: AsyncSession,
    params: PageParams,
) -> PaginatedResponse[DepartmentResponse]:
    repository = DepartmentRepository(session)
    total = await repository.count_all()
    departments = await repository.list_all(offset=params.offset, limit=params.page_size)
    return PaginatedResponse.build(items=departments, total=total, params=params)


async def get_department(department_id: uuid.UUID, session: AsyncSession) -> Department:
    repository = DepartmentRepository(session)
    return await repository.get_by_id_or_raise(department_id)


async def create_department(
    request: CreateDepartmentRequest,
    session: AsyncSession,
) -> Department:
    repository = DepartmentRepository(session)

    existing = await repository.get_by_code(request.code)
    if existing is not None:
        raise ConflictError(f"A department with code '{request.code}' already exists.")

    department = Department(
        name=request.name,
        code=request.code,
        description=request.description,
        parent_id=request.parent_id,
        head_id=request.head_id,
        status=EntityStatus.ACTIVE,
    )
    return await repository.create(department)


async def update_department(
    department_id: uuid.UUID,
    request: UpdateDepartmentRequest,
    session: AsyncSession,
) -> Department:
    repository = DepartmentRepository(session)
    department = await repository.get_by_id_or_raise(department_id)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(department, field, value)

    await session.flush()
    await session.refresh(department)
    return department


async def update_department_status(
    department_id: uuid.UUID,
    request: UpdateStatusRequest,
    session: AsyncSession,
) -> Department:
    repository = DepartmentRepository(session)
    department = await repository.get_by_id_or_raise(department_id)
    department.status = request.status

    await session.flush()
    await session.refresh(department)
    return department
