import pytest
from datetime import date, datetime, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import AssetStatus, UserRole
from app.core.security import create_access_token
from app.modules.allocations.models import Allocation
from app.modules.assets.models import Asset
from app.modules.bookings.models import Booking
from app.modules.categories.models import AssetCategory
from app.modules.departments.models import Department
from app.modules.employees.models import Employee
from app.modules.maintenance.models import MaintenanceRequest


@pytest.mark.asyncio
async def test_reports_endpoints(client: AsyncClient, session: AsyncSession) -> None:
    category = AssetCategory(name="Electronics Test", description="Category for test reports", status="active")
    session.add(category)
    await session.flush()
    department = Department(name="Engineering Test", code="ENG-TEST", description="Engineering test dept", status="active")
    session.add(department)
    await session.flush()
    employee = Employee(
        email="test_manager@company.com",
        hashed_password="hashed_pass_xyz",
        first_name="Test",
        last_name="Manager",
        role=UserRole.ADMIN,
        status="active",
        department_id=department.id,
    )
    session.add(employee)
    await session.flush()
    asset1 = Asset(
        name="Test Laptop 1",
        asset_tag="AF-T001",
        category_id=category.id,
        status=AssetStatus.AVAILABLE,
        is_bookable=True,
        next_maintenance_date=date.today() + timedelta(days=5),
        expected_lifespan_years=4,
        acquisition_date=date.today() - timedelta(days=365 * 4 + 10),
    )
    asset2 = Asset(
        name="Test Laptop 2",
        asset_tag="AF-T002",
        category_id=category.id,
        status=AssetStatus.ALLOCATED,
        is_bookable=False,
        next_maintenance_date=date.today() - timedelta(days=2),
        expected_lifespan_years=3,
        acquisition_date=date.today() - timedelta(days=100),
    )
    session.add_all([asset1, asset2])
    await session.flush()
    booking = Booking(
        asset_id=asset1.id,
        booked_by=employee.id,
        start_time=datetime.now() + timedelta(days=1),
        end_time=datetime.now() + timedelta(days=1, hours=2),
        status="upcoming",
        purpose="Testing reports uses",
    )
    session.add(booking)
    await session.flush()
    allocation = Allocation(
        asset_id=asset2.id,
        employee_id=employee.id,
        department_id=department.id,
        allocated_by=employee.id,
        status="active",
        expected_return_date=date.today() - timedelta(days=5),
    )
    session.add(allocation)
    await session.flush()
    maintenance = MaintenanceRequest(
        asset_id=asset2.id, raised_by=employee.id, description="Flickering screen on test laptop 2", priority="medium", status="pending"
    )
    session.add(maintenance)
    await session.commit()
    token = create_access_token(employee.id)
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/api/v1/reports/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["assets_available"] >= 1
    assert data["assets_allocated"] >= 1
    assert data["active_bookings"] >= 1
    assert data["overdue_allocations"] >= 1
    assert data["pending_maintenance_requests"] >= 1
    response = await client.get("/api/v1/reports/utilization", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_assets"] >= 2
    assert data["utilization_rate"] > 0
    response = await client.get("/api/v1/reports/departments", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["department_name"] == "Engineering Test"
    assert data[0]["total_allocations"] >= 1
    response = await client.get("/api/v1/reports/most-used", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Laptop 1"
    assert data[0]["usage_count"] >= 1
    response = await client.get("/api/v1/reports/idle", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    response = await client.get("/api/v1/reports/maintenance-retirement", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["due_for_maintenance"]) >= 2
    assert len(data["nearing_retirement"]) >= 1
    assert "service due in" in data["due_for_maintenance"][0]["description"] or "service overdue by" in data["due_for_maintenance"][0]["description"]
    assert "nearing retirement" in data["nearing_retirement"][0]["description"]
    response = await client.get("/api/v1/reports/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "utilization" in data
    assert "departments" in data
    assert "most_used" in data
    response = await client.get("/api/v1/reports/export", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "Asset Flow - Comprehensive Reports Export" in response.text
