"""路由模块初始化"""
from .health import health_router
from .xenos import xenos_router
from .towwow import towwow_router

__all__ = ["health_router", "xenos_router", "towwow_router"]
