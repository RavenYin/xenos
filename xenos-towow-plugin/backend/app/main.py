"""Xenos Plugin for ToWow - Main Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

from .routers import health, xenos, towwow

load_dotenv()


class Settings(BaseSettings):
    xenos_api_base: str = "http://localhost:3000/api/v1"
    towwow_api_base: str = "http://localhost:8000"
    webhook_secret: str = "dev-secret"
    log_level: str = "INFO"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False
    }


settings = Settings()


def create_app():
    """创建 FastAPI 应用"""
    app = FastAPI(
        title="Xenos Plugin for ToWow",
        description="为 ToWow Agent 提供 Xenos 身份和信誉记录",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # 添加 CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册路由
    app.include_router(health.health_router, prefix="", tags=["Health"])
    app.include_router(xenos.xenos_router, prefix="/api/xenos", tags=["Xenos"])
    app.include_router(towwow.towwow_router, prefix="/api/towwow", tags=["ToWow"])

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
