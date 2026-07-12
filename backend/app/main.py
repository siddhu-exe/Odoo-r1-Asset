from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.seed import seed_admin
from app.shared.middleware import RequestContextMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with AsyncSessionLocal() as session:
        await seed_admin(session)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="Enterprise Asset & Resource Management System",
        openapi_url=f"/api/{settings.API_VERSION}/openapi.json",
        docs_url=f"/api/{settings.API_VERSION}/docs",
        redoc_url=f"/api/{settings.API_VERSION}/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)

    app.include_router(api_router, prefix=f"/api/{settings.API_VERSION}")

    return app


app = create_app()
