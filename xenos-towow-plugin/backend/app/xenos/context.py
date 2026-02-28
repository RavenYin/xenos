"""Xenos Context Service - 业务场景上下文管理"""
from typing import Dict, List, Optional, Any
from datetime import datetime


# 预定义的业务场景上下文
PREDEFINED_CONTEXTS = {
    "negotiation": {
        "name": "协商",
        "description": "Agent 在 ToWow 网络中的协商行为",
        "weight": 1.0,
        "actions": [
            "accept_demand",
            "submit_proposal",
            "withdraw_proposal",
            "negotiation_completed",
            "negotiation_failed"
        ]
    },
    "task_execution": {
        "name": "任务执行",
        "description": "Agent 执行实际任务的行为",
        "weight": 1.5,
        "actions": [
            "start_task",
            "complete_task",
            "fail_task",
            "pause_task",
            "resume_task"
        ]
    },
    "communication": {
        "name": "通信",
        "description": "Agent 与其他 Agent 的通信行为",
        "weight": 0.8,
        "actions": [
            "send_message",
            "respond_to_message",
            "initiate_call"
        ]
    },
    "payment": {
        "name": "支付",
        "description": "Agent 的支付和收款行为",
        "weight": 2.0,
        "actions": [
            "make_payment",
            "receive_payment",
            "refund_payment"
        ]
    },
    "reputation_feedback": {
        "name": "信誉反馈",
        "description": "Agent 给予和收到的信誉反馈",
        "weight": 1.2,
        "actions": [
            "give_feedback",
            "receive_feedback",
            "respond_to_feedback"
        ]
    }
}


class ContextService:
    """上下文服务管理类"""

    def __init__(self):
        self.custom_contexts: Dict[str, Dict[str, Any]] = {}

    def get_context(self, context_id: str) -> Optional[Dict[str, Any]]:
        """获取上下文定义"""
        return PREDEFINED_CONTEXTS.get(context_id) or self.custom_contexts.get(context_id)

    def list_contexts(self) -> List[Dict[str, Any]]:
        """列出所有可用的上下文"""
        contexts = []
        for ctx_id, ctx_data in PREDEFINED_CONTEXTS.items():
            contexts.append({
                "id": ctx_id,
                **ctx_data
            })
        for ctx_id, ctx_data in self.custom_contexts.items():
            contexts.append({
                "id": ctx_id,
                **ctx_data
            })
        return contexts

    def create_custom_context(
        self,
        context_id: str,
        name: str,
        description: str,
        weight: float = 1.0,
        actions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """创建自定义上下文"""
        context = {
            "name": name,
            "description": description,
            "weight": weight,
            "actions": actions or [],
            "createdAt": datetime.now().isoformat()
        }
        self.custom_contexts[context_id] = context
        return context

    def get_action_context(self, action: str) -> Optional[str]:
        """根据动作查找所属上下文"""
        for ctx_id, ctx_data in PREDEFINED_CONTEXTS.items():
            if action in ctx_data["actions"]:
                return ctx_id
        for ctx_id, ctx_data in self.custom_contexts.items():
            if action in ctx_data["actions"]:
                return ctx_id
        return None

    def get_context_weight(self, context_id: str) -> float:
        """获取上下文权重"""
        context = self.get_context(context_id)
        return context["weight"] if context else 1.0


# 全局上下文服务实例
context_service = ContextService()


def get_context_service() -> ContextService:
    """获取上下文服务单例"""
    return context_service
