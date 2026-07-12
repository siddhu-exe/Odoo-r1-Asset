from fastapi import APIRouter

from app.modules.allocations.router import router as allocations_router
from app.modules.assets.router import router as assets_router
from app.modules.audits.router import router as audits_router
from app.modules.auth.router import router as auth_router
from app.modules.bookings.router import router as bookings_router
from app.modules.categories.router import router as categories_router
from app.modules.departments.router import router as departments_router
from app.modules.employees.router import router as employees_router
from app.modules.maintenance.router import router as maintenance_router
from app.modules.notifications.router import router as notifications_router
from app.modules.reports.router import router as reports_router


api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(employees_router, prefix="/employees", tags=["employees"])
api_router.include_router(departments_router, prefix="/departments", tags=["departments"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_router.include_router(assets_router, prefix="/assets", tags=["assets"])
api_router.include_router(allocations_router, prefix="/allocations", tags=["allocations"])
api_router.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
api_router.include_router(maintenance_router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(audits_router, prefix="/audits", tags=["audits"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
