"""健康检查端点"""
from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "ok",
        "service": "xenos-towow-plugin",
        "version": "0.1.0"
    }


@health_router.get("/")
async def root():
    """根路径"""
    return {
        "name": "Xenos Plugin for ToWow",
        "description": "为 ToWow Agent 提供 Xenos 身份和信誉记录",
        "version": "0.1.0",
        "documentation": "/docs"
    }
