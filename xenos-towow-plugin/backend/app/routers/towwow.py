"""ToWow 路由 - Webhook 和 Agent 交互"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json

from ..xenos.trace import record_trace, get_agent_traces, query_traces
from ..xenos.identity import generate_xenos_id
from ..xenos.reputation import calculate_agent_reputation

towwow_router = APIRouter()


# ==================== 请求/响应模型 ====================

class WebhookEvent(BaseModel):
    agentXenosId: Optional[str] = None
    demandId: Optional[str] = None
    runId: Optional[str] = None
    success: Optional[bool] = None
    eventType: str  # demand_accepted, proposal_submitted, run_completed, etc.
    metadata: Optional[Dict[str, Any]] = None


class AgentRegisterRequest(BaseModel):
    agentName: str
    agentType: Optional[str] = "towow-agent"
    capabilities: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class IntentEnrichRequest(BaseModel):
    agentXenosId: str
    intent: Dict[str, Any]
    context: Optional[str] = "negotiation"


class TraceRecordRequest(BaseModel):
    agentXenosId: str
    eventType: str
    demandId: Optional[str] = None
    runId: Optional[str] = None
    success: bool = True
    context: str = "negotiation"
    action: str
    metadata: Optional[Dict[str, Any]] = None


# ==================== Webhook 端点 ====================

def verify_webhook_signature(payload: str, signature: str) -> bool:
    """验证 ToWow Webhook 签名

    MVP 阶段简化实现，实际部署时需要配置正确的公钥
    """
    # TODO: 实现真实的签名验证
    # 1. 从配置中获取 ToWow 公钥
    # 2. 使用公钥验证签名
    return True


@towwow_router.post("/webhooks/toww")
async def handle_toww_webhook(request: Request):
    """处理 ToWow Webhook

    支持的事件类型：
    - demand_accepted: 需求被接受
    - proposal_submitted: 提交提案
    - run_completed: 协商完成
    - run_failed: 协商失败
    - task_started: 任务开始
    - task_completed: 任务完成
    - task_failed: 任务失败
    """
    # 获取原始 body 用于签名验证
    body = await request.body()

    try:
        # 解析 JSON
        payload = json.loads(body)

        # 获取签名头（假设在 X-Signature 头中）
        signature = request.headers.get("X-Signature", "")

        # 验证签名（可选，实际部署时启用）
        if signature:
            if not verify_webhook_signature(body.decode(), signature):
                raise HTTPException(status_code=401, detail="Invalid signature")

        event = payload.get("eventType", "")
        data = payload.get("data", {})

        xenos_id = data.get("agentXenosId")

        # 记录到 Xenos
        if xenos_id:
            # 根据事件类型确定上下文和动作
            trace_context, trace_action, trace_result = _map_event_to_trace(event, data)

            metadata = {
                "eventType": event,
                "demandId": data.get("demandId"),
                "runId": data.get("runId"),
                **data.get("metadata", {})
            }

            result = record_trace(
                xenos_id=xenos_id,
                network="towow",
                context=trace_context,
                action=trace_action,
                result=trace_result,
                metadata=metadata
            )

            return {
                "code": 0,
                "message": "Webhook processed",
                "data": {
                    "xenosId": xenos_id,
                    "traceId": result.get("traceId"),
                    "recorded": result.get("recorded", False)
                }
            }

        return {
            "code": 0,
            "message": "Webhook processed (no xenosId found)"
        }

    except HTTPException:
        raise
    except Exception as e:
        return {
            "code": 1,
            "error": f"Webhook processing failed: {str(e)}"
        }


def _map_event_to_trace(event: str, data: Dict[str, Any]) -> tuple:
    """将 ToWow 事件映射到 Xenos trace

    Returns:
        (context, action, result)
    """
    event_mapping = {
        "demand_accepted": ("negotiation", "accept_demand", "success"),
        "demand_rejected": ("negotiation", "reject_demand", "success"),
        "proposal_submitted": ("negotiation", "submit_proposal", "success"),
        "proposal_rejected": ("negotiation", "proposal_rejected", "success"),
        "proposal_accepted": ("negotiation", "proposal_accepted", "success"),
        "run_completed": ("negotiation", "complete_negotiation", "success"),
        "run_failed": ("negotiation", "negotiation_failed", "failed"),
        "task_started": ("task_execution", "start_task", "success"),
        "task_completed": ("task_execution", "complete_task", "success"),
        "task_failed": ("task_execution", "fail_task", "failed"),
        "payment_initiated": ("payment", "initiate_payment", "success"),
        "payment_completed": ("payment", "complete_payment", "success"),
        "payment_failed": ("payment", "fail_payment", "failed"),
    }

    default_result = "success" if data.get("success", True) else "failed"
    return event_mapping.get(event, ("negotiation", f"webhook_{event}", default_result))


# ==================== Agent 管理端点 ====================

@towwow_router.post("/agent/register")
async def register_agent(request: AgentRegisterRequest):
    """ToWow Agent 注册，自动创建 Xenos 身份

    这个端点让 ToWow 网络中的 Agent 自动获得 Xenos 身份
    """
    try:
        result = generate_xenos_id(request.agentName)

        # 如果提供了额外能力信息，记录为初始 metadata
        if request.capabilities or request.metadata:
            # 这里可以调用 record_trace 记录初始信息
            pass

        return {
            "code": 0,
            "data": {
                "agentId": result.get("agentId", ""),
                "agentName": request.agentName,
                "agentType": request.agentType,
                "capabilities": request.capabilities or ["negotiation", "task-execution"],
                "xenosId": result["xenosId"],
                "privateKey": result["privateKey"],
                "didDocument": result["didDocument"],
                "network": "towow"
            }
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


@towwow_router.get("/agent/{xenos_id}")
async def get_agent_info(xenos_id: str):
    """获取 ToWow Agent 的 Xenos 信息"""
    try:
        # 获取 Agent 的 Xenos 信息
        result = generate_xenos_id("", xenos_id)

        # 获取 Agent 的信誉
        reputation = calculate_agent_reputation(xenos_id)

        # 获取最近的行为记录
        traces = get_agent_traces(xenos_id, limit=10)

        return {
            "code": 0,
            "data": {
                "xenosId": xenos_id,
                "didDocument": result.get("didDocument", {}),
                "reputation": reputation,
                "recentTraces": traces.get("traces", [])[:5],
                "network": "towow"
            }
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


# ==================== 意图注入端点 ====================

@towwow_router.post("/intent/enrich")
async def enrich_intent(request: IntentEnrichRequest):
    """意图注入 - 在 ToWow 需求匹配时注入 Xenos 身份和信誉

    这个端点用于在 ToWow 发现层进行需求匹配时，增强 Agent 信息
    """
    try:
        # 获取 Agent 的场景化信誉
        reputation = calculate_agent_reputation(
            request.agentXenosId,
            context=request.context
        )

        # 获取最近的相关行为记录
        traces_result = query_traces(
            xenos_id=request.agentXenosId,
            context=request.context,
            limit=10
        )

        # 构建增强后的意图
        enriched_intent = {
            **request.intent,
            "xenos": {
                "xenosId": request.agentXenosId,
                "reputation": reputation,
                "recentActivity": traces_result.get("traces", [])[:5],
                "network": "towow"
            }
        }

        return {
            "code": 0,
            "data": {
                "originalIntent": request.intent,
                "enrichedIntent": enriched_intent,
                "enrichmentApplied": True
            }
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


# ==================== 痕迹记录端点 ====================

@towwow_router.post("/trace/record")
async def record_towwow_trace(request: TraceRecordRequest):
    """记录 ToWow 行为痕迹

    这个端点让 ToWow 可以直接记录协商过程中的行为
    """
    try:
        result = record_trace(
            xenos_id=request.agentXenosId,
            network="towow",
            context=request.context,
            action=request.action,
            result="success" if request.success else "failed",
            metadata={
                "eventType": request.eventType,
                "demandId": request.demandId,
                "runId": request.runId,
                **(request.metadata or {})
            }
        )

        return {
            "code": 0,
            "data": result
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


@towwow_router.get("/trace/{xenos_id}")
async def get_towwow_traces(xenos_id: str, limit: int = 50, context: Optional[str] = None):
    """获取 Agent 在 ToWow 中的行为记录"""
    try:
        result = query_traces(
            xenos_id=xenos_id,
            network="towow",
            context=context,
            limit=limit
        )

        return {
            "code": 0,
            "data": result
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


# ==================== 信誉查询端点 ====================

@towwow_router.get("/reputation/{xenos_id}")
async def get_towwow_reputation(xenos_id: str, context: Optional[str] = None):
    """查询 Agent 在 ToWow 场景的信誉

    这个端点专门用于查询 ToWow 相关的信誉
    """
    try:
        reputation = calculate_agent_reputation(xenos_id, context)

        # 如果指定了上下文，返回该上下文的信誉
        if context:
            return {
                "code": 0,
                "data": {
                    "xenosId": xenos_id,
                    "network": "towow",
                    "context": context,
                    **reputation
                }
            }

        # 返回综合信誉
        return {
            "code": 0,
            "data": {
                "xenosId": xenos_id,
                "network": "towow",
                **reputation
            }
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


@towwow_router.get("/reputation/{xenos_id}/summary")
async def get_reputation_summary(xenos_id: str):
    """获取 Agent 信誉摘要（简化版）"""
    try:
        reputation = calculate_agent_reputation(xenos_id)

        # 提取关键信息
        summary = {
            "xenosId": xenos_id,
            "overallScore": reputation.get("overallScore", 500),
            "hasFraud": reputation.get("hasFraud", False),
            "fulfillmentRate": reputation.get("details", {}).get("fulfillmentRate", 0.5),
            "confidence": "medium",
            "network": "towow",
            "contextSummary": {}
        }

        # 提取各上下文的摘要
        for ctx in reputation.get("contexts", []):
            summary["contextSummary"][ctx["context"]] = {
                "score": ctx["score"],
                "fulfillmentRate": ctx["fulfillmentRate"]
            }

        return {
            "code": 0,
            "data": summary
        }
    except Exception as e:
        return {"code": 1, "error": str(e)}


# ==================== Demo 端点 ====================

@towwow_router.get("/demo")
async def demo_agent():
    """演示：返回一个示例 Agent 配置"""
    return {
        "code": 0,
        "data": {
            "agentName": "Demo Agent",
            "agentType": "towow-agent",
            "capabilities": ["negotiation", "task-execution"],
            "xenosId": "did:key:demo1234567890",
            "webhookUrl": "/api/towwow/webhooks/toww",
            "usage": {
                "step1": "ToWow Agent 注册时调用 POST /api/towwow/agent/register",
                "step2": "需求匹配时调用 POST /api/towwow/intent/enrich 注入信誉",
                "step3": "协商过程中调用 POST /api/towwow/trace/record 记录行为",
                "step4": "查询信誉调用 GET /api/towwow/reputation/{xenos_id}"
            },
            "endpoints": {
                "register": "POST /api/towwow/agent/register",
                "enrichIntent": "POST /api/towwow/intent/enrich",
                "recordTrace": "POST /api/towwow/trace/record",
                "getTraces": "GET /api/towwow/trace/{xenos_id}",
                "getReputation": "GET /api/towwow/reputation/{xenos_id}",
                "getReputationSummary": "GET /api/towwow/reputation/{xenos_id}/summary"
            }
        }
    }


@towwow_router.get("/mock/sync-traces")
async def mock_sync_traces():
    """演示：模拟同步 traces（测试用）"""
    # 模拟一些历史 traces
    from datetime import datetime, timedelta

    xenos_id = "did:key:mock_agent_demo"
    mock_traces = []

    # 生成不同时间段的 traces
    now = datetime.now()
    scenarios = [
        (5, "success", "accept_demand"),       # 最近5天
        (35, "success", "submit_proposal"),    # 35天前
        (100, "success", "complete_task"),     # 100天前
        (200, "failed", "fail_task"),          # 200天前
    ]

    for days_ago, result, action in scenarios:
        timestamp = (now - timedelta(days=days_ago)).isoformat()

        for _ in range(5):  # 每个时间段生成5条
            record_trace(
                xenos_id=xenos_id,
                network="towow",
                context="negotiation" if "demand" in action or "proposal" in action else "task_execution",
                action=action,
                result=result,
                metadata={"mock": True}
            )

    return {
        "code": 0,
        "message": f"已为 {xenos_id} 生成 20 条模拟 traces",
        "xenosId": xenos_id,
        "tracesCount": 20
    }
