from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
print(f"[DEBUG] SECRET_KEY: {settings.SECRET_KEY}")
from app.core.logging import configure_logging
from app.api_v1.router import api_router


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(
        title="PrintLab 3D Manager API",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        redirect_slashes=False,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"] ,
        allow_headers=["*"] ,
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/healthz")
    def healthz():
        return {"status": "ok"}

    return app


app = create_app()
