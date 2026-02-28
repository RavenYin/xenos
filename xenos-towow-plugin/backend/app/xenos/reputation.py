"""Xenos Reputation Service - 场景化信誉计算"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import math

from .context import get_context_service
from .trace import get_agent_traces

# 衰减参数配置
DECAY_WEIGHTS = {
    "recent_30_days": 1.0,
    "days_31_to_90": 0.7,
    "days_91_to_180": 0.4,
    "over_180_days": 0.2
}

# 恶意欺诈永久标记，不参与衰减
FRAUD_PERMANENT = True

# 恶意行为标记列表
FRAUD_ACTIONS = [
    "fraud",
    "cheat",
    "malicious",
    "double_spend",
    "backtrack"
]


class ReputationService:
    """信誉服务管理类"""

    def __init__(self):
        self.context_service = get_context_service()

    def calculate_reputation(
        self,
        xenos_id: str,
        context: Optional[str] = None,
        time_window_days: int = 90
    ) -> Dict[str, Any]:
        """
        计算 Agent 的场景化信誉（含衰减机制）

        Args:
            xenos_id: Xenos ID
            context: 上下文类型（None 表示综合信誉）
            time_window_days: 时间窗口（天数）

        Returns:
            信誉分数和详细信息
        """
        # 获取行为记录
        traces_result = get_agent_traces(xenos_id, limit=1000)
        traces = traces_result.get("traces", [])

        # 检查是否有恶意欺诈行为
        fraud_traces = self._check_fraud_traces(traces)
        has_fraud = len(fraud_traces) > 0

        # 使用衰减机制计算整体信誉
        overall_score = self._calculate_overall_score_with_decay(traces, has_fraud)

        # 计算各上下文信誉
        context_scores = self._calculate_context_scores_with_decay(traces, has_fraud)

        # 如果指定了上下文，返回该上下文的信誉
        if context:
            context_data = self.context_service.get_context(context)
            if context_data:
                context_traces = [
                    t for t in traces
                    if t.get("context") == context
                ]
                context_score = self._calculate_context_score_with_decay(context_traces, context_data["weight"], has_fraud)

                # 获取该上下文的欺诈记录
                context_fraud = [t for t in fraud_traces if t.get("context") == context]

                return {
                    "xenosId": xenos_id,
                    "context": context,
                    "contextName": context_data["name"],
                    "score": context_score,
                    "overallScore": overall_score,
                    "details": {
                        "fulfillmentRate": self._calculate_fulfillment_rate(context_traces),
                        "fulfilledCount": len([t for t in context_traces if t.get("result") == "success"]),
                        "failedCount": len([t for t in context_traces if t.get("result") == "failed"]),
                        "totalCount": len(context_traces),
                        "recentActivity": len(context_traces),
                        "confidence": self._calculate_confidence(context_traces),
                        "hasFraud": len(context_fraud) > 0,
                        "fraudCount": len(context_fraud),
                        "decayApplied": self._get_decay_summary(context_traces)
                    },
                    "timestamp": datetime.now().isoformat()
                }

        # 返回综合信誉
        return {
            "xenosId": xenos_id,
            "overallScore": overall_score,
            "hasFraud": has_fraud,
            "fraudCount": len(fraud_traces),
            "contexts": context_scores,
            "details": {
                "fulfillmentRate": self._calculate_fulfillment_rate(traces),
                "fulfilledCount": len([t for t in traces if t.get("result") == "success"]),
                "failedCount": len([t for t in traces if t.get("result") == "failed"]),
                "totalCount": len(traces),
                "timeWindowDays": time_window_days,
                "decayApplied": self._get_decay_summary(traces)
            },
            "timestamp": datetime.now().isoformat()
        }

    def _check_fraud_traces(self, traces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """检查是否有欺诈行为记录"""
        return [
            t for t in traces
            if t.get("action", "").lower() in [f.lower() for f in FRAUD_ACTIONS]
            or t.get("result") == "fraud"
            or t.get("metadata", {}).get("isFraud") is True
        ]

    def _apply_decay_weights(self, traces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        应用衰减权重到 traces

        衰减规则：
        - 最近 30 天：权重 1.0
        - 31-90 天：权重 0.7
        - 91-180 天：权重 0.4
        - 180 天以上：权重 0.2
        - 恶意欺诈：永久标记（已在其他方法处理）
        """
        now = datetime.now()
        weighted_traces = []

        for trace in traces:
            timestamp_str = trace.get("timestamp", "")
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                days_ago = (now - timestamp).days

                # 确定衰减权重
                if days_ago <= 30:
                    weight = DECAY_WEIGHTS["recent_30_days"]
                elif days_ago <= 90:
                    weight = DECAY_WEIGHTS["days_31_to_90"]
                elif days_ago <= 180:
                    weight = DECAY_WEIGHTS["days_91_to_180"]
                else:
                    weight = DECAY_WEIGHTS["over_180_days"]

                weighted_traces.append({**trace, "decayWeight": weight})
            except:
                # 时间解析失败，使用最小权重
                weighted_traces.append({**trace, "decayWeight": DECAY_WEIGHTS["over_180_days"]})

        return weighted_traces

    def _calculate_overall_score_with_decay(self, traces: List[Dict[str, Any]], has_fraud: bool) -> float:
        """
        计算整体信誉分数（含衰减机制）

        衰减规则：
        - 最近 30 天：权重 1.0
        - 31-90 天：权重 0.7
        - 91-180 天：权重 0.4
        - 180 天以上：权重 0.2
        - 恶意欺诈：永久标记，不参与衰减
        """
        if not traces:
            return 500.0  # 初始分数

        # 欺诈行为直接扣分
        if has_fraud and FRAUD_PERMANENT:
            return 0.0  # 有欺诈记录直接归零

        # 将 traces 按时间分组并应用衰减权重
        weighted_traces = self._apply_decay_weights(traces)

        # 基于加权履约率的分数
        weighted_fulfillment_rate = self._calculate_weighted_fulfillment_rate(weighted_traces)
        base_score = weighted_fulfillment_rate * 1000

        # 活跃度加成（使用加权后的数量）
        activity_bonus = min(sum(w["decayWeight"] for w in weighted_traces) * 2, 100)

        # 综合分数
        total_score = base_score + activity_bonus

        return min(max(total_score, 0), 1000)  # 限制在 0-1000

    def _calculate_context_scores_with_decay(self, traces: List[Dict[str, Any]], has_fraud: bool) -> List[Dict[str, Any]]:
        """计算各上下文信誉分数（含衰减机制）"""
        context_scores = []
        contexts = self.context_service.list_contexts()

        weighted_traces = self._apply_decay_weights(traces)

        for ctx in contexts:
            ctx_id = ctx["id"]
            ctx_weighted_traces = [t for t in weighted_traces if t.get("context") == ctx_id]

            if ctx_weighted_traces:
                score = self._calculate_context_score_with_decay(ctx_weighted_traces, ctx["weight"], has_fraud)

                # 统计该上下文的欺诈记录
                fraud_in_context = [t for t in ctx_weighted_traces if t.get("result") == "fraud" or t.get("metadata", {}).get("isFraud")]

                context_scores.append({
                    "context": ctx_id,
                    "contextName": ctx["name"],
                    "score": score,
                    "fulfillmentRate": self._calculate_weighted_fulfillment_rate(ctx_weighted_traces),
                    "fulfilledCount": len([t for t in ctx_weighted_traces if t.get("result") == "success"]),
                    "failedCount": len([t for t in ctx_weighted_traces if t.get("result") == "failed"]),
                    "totalCount": len(ctx_weighted_traces),
                    "confidence": self._calculate_weighted_confidence(ctx_weighted_traces),
                    "hasFraud": len(fraud_in_context) > 0,
                    "fraudCount": len(fraud_in_context)
                })

        return context_scores

    def _calculate_context_score_with_decay(self, weighted_traces: List[Dict[str, Any]], weight: float, has_fraud: bool) -> float:
        """计算单个上下文的分数（含衰减机制）"""
        if not weighted_traces:
            return 500.0

        # 检查是否有欺诈
        if has_fraud and FRAUD_PERMANENT:
            fraud_in_context = [t for t in weighted_traces if t.get("result") == "fraud" or t.get("metadata", {}).get("isFraud")]
            if fraud_in_context:
                return 0.0

        weighted_fulfillment_rate = self._calculate_weighted_fulfillment_rate(weighted_traces)
        base_score = weighted_fulfillment_rate * 1000

        # 应用权重
        weighted_score = base_score * weight

        return min(max(weighted_score, 0), 1000)

    def _calculate_fulfillment_rate(self, traces: List[Dict[str, Any]]) -> float:
        """计算履约率（未加权）"""
        if not traces:
            return 0.5

        success_count = len([t for t in traces if t.get("result") == "success"])
        failed_count = len([t for t in traces if t.get("result") == "failed"])
        total = success_count + failed_count

        if total == 0:
            return 0.5

        return success_count / total

    def _calculate_weighted_fulfillment_rate(self, weighted_traces: List[Dict[str, Any]]) -> float:
        """计算加权履约率"""
        if not weighted_traces:
            return 0.5

        weighted_success = sum(
            t.get("decayWeight", 1.0)
            for t in weighted_traces
            if t.get("result") == "success"
        )
        weighted_failed = sum(
            t.get("decayWeight", 1.0)
            for t in weighted_traces
            if t.get("result") == "failed"
        )
        weighted_total = weighted_success + weighted_failed

        if weighted_total == 0:
            return 0.5

        return weighted_success / weighted_total

    def _calculate_confidence(self, traces: List[Dict[str, Any]]) -> str:
        """计算可信度（未加权）"""
        if len(traces) < 5:
            return "low"
        elif len(traces) < 20:
            return "medium"
        else:
            return "high"

    def _calculate_weighted_confidence(self, weighted_traces: List[Dict[str, Any]]) -> str:
        """计算加权可信度"""
        weighted_count = sum(t.get("decayWeight", 1.0) for t in weighted_traces)

        if weighted_count < 5:
            return "low"
        elif weighted_count < 20:
            return "medium"
        else:
            return "high"

    def _get_decay_summary(self, traces: List[Dict[str, Any]]) -> Dict[str, Any]:
        """获取衰减摘要统计"""
        now = datetime.now()

        summary = {
            "totalTraces": len(traces),
            "byTimePeriod": {
                "recent_30_days": 0,
                "days_31_to_90": 0,
                "days_91_to_180": 0,
                "over_180_days": 0
            },
            "weightedTotal": 0.0
        }

        weighted_traces = self._apply_decay_weights(traces)

        for trace in weighted_traces:
            weight = trace.get("decayWeight", 1.0)
            timestamp_str = trace.get("timestamp", "")
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                days_ago = (now - timestamp).days

                if days_ago <= 30:
                    summary["byTimePeriod"]["recent_30_days"] += 1
                elif days_ago <= 90:
                    summary["byTimePeriod"]["days_31_to_90"] += 1
                elif days_ago <= 180:
                    summary["byTimePeriod"]["days_91_to_180"] += 1
                else:
                    summary["byTimePeriod"]["over_180_days"] += 1

                summary["weightedTotal"] += weight
            except:
                pass

        return summary


# 全局信誉服务实例
reputation_service = ReputationService()


def get_reputation_service() -> ReputationService:
    """获取信誉服务单例"""
    return reputation_service


def calculate_agent_reputation(
    xenos_id: str,
    context: Optional[str] = None,
    time_window_days: int = 90
) -> Dict[str, Any]:
    """计算 Agent 信誉（便捷函数）"""
    return reputation_service.calculate_reputation(xenos_id, context, time_window_days)
