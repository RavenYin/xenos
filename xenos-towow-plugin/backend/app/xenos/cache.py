"""
Redis 缓存模块
用于独立插件服务的缓存层

环境变量：
- REDIS_URL: Redis 连接 URL
- REDIS_ENABLED: 是否启用 Redis
"""

import json
import logging
import os
from functools import wraps
from typing import Any, Callable, Optional, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")

# 缓存 TTL 配置（秒）
CACHE_TTL = {
    "reputation": 300,      # 信誉分数：5 分钟
    "agent_profile": 300,   # Agent 档案：5 分钟
    "traces": 120,          # 痕迹列表：2 分钟
}

# 缓存键前缀
CACHE_PREFIX = "xenos_plugin:"


class CacheBackend:
    """缓存后端抽象"""

    def get(self, key: str) -> Optional[str]:
        raise NotImplementedError

    def set(self, key: str, value: str, ttl: Optional[int] = None) -> None:
        raise NotImplementedError

    def delete(self, key: str) -> None:
        raise NotImplementedError


class MemoryCache(CacheBackend):
    """内存缓存实现（开发/测试用）"""

    def __init__(self):
        self._cache: dict[str, tuple[str, float]] = {}
        self._ttl_default = 60

    def get(self, key: str) -> Optional[str]:
        import time

        entry = self._cache.get(key)
        if not entry:
            return None

        value, expires_at = entry
        if time.time() > expires_at:
            del self._cache[key]
            return None

        return value

    def set(self, key: str, value: str, ttl: Optional[int] = None) -> None:
        import time

        expires_at = time.time() + (ttl or self._ttl_default)
        self._cache[key] = (value, expires_at)

    def delete(self, key: str) -> None:
        self._cache.pop(key, None)

    def clear(self) -> None:
        self._cache.clear()


class RedisCache(CacheBackend):
    """Redis 缓存实现"""

    def __init__(self, url: str):
        self._url = url
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            try:
                import redis

                self._client = redis.from_url(self._url)
                logger.info(f"[Redis] Connected to {self._url}")
            except ImportError:
                logger.warning("[Redis] redis package not installed, using memory cache")
                raise
        return self._client

    def get(self, key: str) -> Optional[str]:
        try:
            client = self._get_client()
            value = client.get(key)
            return value.decode() if value else None
        except Exception as e:
            logger.error(f"[Redis] Get error: {e}")
            return None

    def set(self, key: str, value: str, ttl: Optional[int] = None) -> None:
        try:
            client = self._get_client()
            if ttl:
                client.setex(key, ttl, value)
            else:
                client.set(key, value)
        except Exception as e:
            logger.error(f"[Redis] Set error: {e}")

    def delete(self, key: str) -> None:
        try:
            client = self._get_client()
            client.delete(key)
        except Exception as e:
            logger.error(f"[Redis] Delete error: {e}")


# 全局缓存实例
_cache: Optional[CacheBackend] = None


def get_cache() -> CacheBackend:
    """获取缓存实例"""
    global _cache

    if _cache is not None:
        return _cache

    enabled = os.getenv("REDIS_ENABLED", "false").lower() == "true"
    url = os.getenv("REDIS_URL", "redis://localhost:6379")

    if enabled:
        try:
            _cache = RedisCache(url)
            # 测试连接
            _cache.get("__test__")
        except Exception as e:
            logger.warning(f"[Redis] Connection failed, falling back to memory: {e}")
            _cache = MemoryCache()
    else:
        _cache = MemoryCache()

    return _cache


def cache_key(*parts: str) -> str:
    """生成缓存键"""
    return CACHE_PREFIX + ":".join(parts)


def cached(ttl: int = 300, key_builder: Optional[Callable[..., str]] = None):
    """
    缓存装饰器

    用法：
        @cached(ttl=300)
        async def get_reputation(xenos_id: str) -> dict:
            ...

        @cached(key_builder=lambda xid: f"rep:{xid}")
        async def get_reputation(xenos_id: str) -> dict:
            ...
    """

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存键
            if key_builder:
                k = key_builder(*args, **kwargs)
            else:
                k = f"{func.__name__}:{':'.join(str(a) for a in args)}"

            full_key = cache_key(k)

            # 尝试从缓存获取
            cache = get_cache()
            cached_value = cache.get(full_key)
            if cached_value is not None:
                try:
                    return json.loads(cached_value)
                except json.JSONDecodeError:
                    pass

            # 执行函数
            result = await func(*args, **kwargs)

            # 缓存结果
            if result is not None:
                try:
                    cache.set(full_key, json.dumps(result), ttl)
                except (TypeError, json.JSONDecodeError):
                    pass

            return result

        return wrapper  # type: ignore

    return decorator


# 便捷函数
def get_cached(key: str) -> Optional[dict]:
    """获取缓存的字典"""
    cache = get_cache()
    value = cache.get(cache_key(key))
    if value:
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            pass
    return None


def set_cached(key: str, value: dict, ttl: Optional[int] = None) -> None:
    """设置缓存"""
    cache = get_cache()
    cache.set(cache_key(key), json.dumps(value), ttl)


def delete_cached(key: str) -> None:
    """删除缓存"""
    cache = get_cache()
    cache.delete(cache_key(key))
