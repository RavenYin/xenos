"""Xenos 路由 - 身份管理和信誉查询"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..xenos.identity import generate_xenos_id, get_agent_reputation
from ..xenos.trace import record_trace, get_agent_traces

xenos_router = APIRouter()


class RegisterRequest(BaseModel):
    agentName: str


class TraceRequest(BaseModel):
    xenosId: str
    context: str
    action: str
    result: str
    demandId: Optional[str] = None
    metadata: Optional[dict] = None


@xenos_router.post("/register")
async def register_agent(request: RegisterRequest):
    """Agent 注册到 Xenos，生成 Xenos ID"""
    try:
        result = generate_xenos_id(request.agentName)
        return {
            "code": 0,
            "data": {
                "agentId": result["agentId"],
                "xenosId": result["xenosId"],
                "privateKey": result["privateKey"],
                "didDocument": result["didDocument"]
            }
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


@xenos_router.get("/agent/{xenos_id}")
async def get_agent(xenos_id: str):
    """获取 Agent 信息"""
    try:
        result = generate_xenos_id("", xenos_id)
        return {
            "code": 0,
            "data": {
                "xenosId": result["xenosId"],
                "didDocument": result["didDocument"]
            }
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


@xenos_router.post("/trace")
async def trace_action(request: TraceRequest):
    """记录行为到 Xenos"""
    try:
        result = record_trace(
            xenos_id=request.xenosId,
            network="towow",
            context=request.context,
            action=request.action,
            result=request.result,
            metadata={
                "demandId": request.demandId,
                **(request.metadata or {})
            }
        )
        return {"code": 0, "data": result}
    except Exception as e:
        return {"code": 1, "error": str(e)}


@xenos_router.get("/reputation/{xenos_id}")
async def get_reputation(xenos_id: str, context: Optional[str] = None):
    """获取场景化信誉"""
    try:
        result = get_agent_reputation(xenos_id, context)
        return {
            "code": 0,
            "data": result
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


@xenos_router.get("/traces/{xenos_id}")
async def get_traces(xenos_id: str, limit: int = 10):
    """获取行为记录"""
    try:
        result = get_agent_traces(xenos_id, limit)
        return {
            "code": 0,
            "data": result
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}
