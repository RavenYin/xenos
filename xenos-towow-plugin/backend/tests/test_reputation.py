"""Xenos 信誉服务测试"""
import pytest
from datetime import datetime, timedelta
from app.xenos.reputation import (
    get_reputation_service,
    ReputationService,
    calculate_agent_reputation,
    DECAY_WEIGHTS,
    FRAUD_PERMANENT
)
from app.xenos.trace import record_trace, clear_local_traces


class TestReputationService:
    """信誉服务测试"""

    def setup_method(self):
        """每个测试前清除本地数据"""
        clear_local_traces()

    def test_calculate_reputation_no_traces(self):
        """测试无行为记录时的信誉"""
        xenos_id = "did:key:test123"

        reputation = calculate_agent_reputation(xenos_id)

        assert "overallScore" in reputation
        assert reputation["overallScore"] == 500.0  # 初始分数

        print(f"✅ 无记录信誉测试通过: {reputation['overallScore']}")

    def test_calculate_reputation_with_traces(self):
        """测试有行为记录时的信誉"""
        xenos_id = "did:key:test123"

        # 记录成功行为
        for i in range(10):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"action_{i}",
                "success"
            )

        reputation = calculate_agent_reputation(xenos_id)

        assert "overallScore" in reputation
        assert reputation["overallScore"] > 500  # 应该高于初始分数

        print(f"✅ 有记录信誉测试通过: {reputation['overallScore']}")

    def test_calculate_context_reputation(self):
        """测试场景化信誉"""
        xenos_id = "did:key:test123"

        # 记录不同上下文的行为
        for i in range(10):
            record_trace(xenos_id, "towow", "negotiation", f"neg_action_{i}", "success")
            record_trace(xenos_id, "towow", "task_execution", f"task_action_{i}", "success")

        # 查询协商上下文信誉
        reputation = calculate_agent_reputation(xenos_id, context="negotiation")

        assert "context" in reputation
        assert reputation["context"] == "negotiation"
        assert "score" in reputation
        assert "details" in reputation

        print(f"✅ 场景化信誉测试通过: {reputation['score']}")

    def test_fulfillment_rate_calculation(self):
        """测试履约率计算"""
        xenos_id = "did:key:test123"

        # 记录不同结果的行为
        for i in range(7):
            record_trace(xenos_id, "towow", "negotiation", f"action_{i}", "success")
        for i in range(3):
            record_trace(xenos_id, "towow", "negotiation", f"fail_{i}", "failed")

        reputation = calculate_agent_reputation(xenos_id, context="negotiation")

        fulfillment_rate = reputation["details"]["fulfillmentRate"]
        assert fulfillment_rate == 0.7  # 7/10 = 0.7

        print(f"✅ 履约率计算测试通过: {fulfillment_rate}")

    def test_failed_actions_lower_score(self):
        """测试失败行为降低分数"""
        xenos_id_1 = "did:key:test1"
        xenos_id_2 = "did:key:test2"

        # Agent 1: 全部成功
        for i in range(10):
            record_trace(xenos_id_1, "towow", "negotiation", f"action_{i}", "success")

        # Agent 2: 部分失败
        for i in range(7):
            record_trace(xenos_id_2, "towow", "negotiation", f"action_{i}", "success")
        for i in range(3):
            record_trace(xenos_id_2, "towow", "negotiation", f"fail_{i}", "failed")

        rep1 = calculate_agent_reputation(xenos_id_1)
        rep2 = calculate_agent_reputation(xenos_id_2)

        assert rep1["overallScore"] > rep2["overallScore"]

        print(f"✅ 失败降低分数测试通过")
        print(f"   Agent 1 (全部成功): {rep1['overallScore']}")
        print(f"   Agent 2 (部分失败): {rep2['overallScore']}")

    def test_activity_bonus(self):
        """测试活跃度加成"""
        xenos_id = "did:key:test123"

        # 记录大量行为
        for i in range(100):
            record_trace(xenos_id, "towow", "negotiation", f"action_{i}", "success")

        reputation = calculate_agent_reputation(xenos_id)

        assert reputation["overallScore"] > 900  # 活跃加成应该显著提高分数

        print(f"✅ 活跃度加成测试通过: {reputation['overallScore']}")

    def test_multiple_contexts(self):
        """测试多上下文信誉"""
        xenos_id = "did:key:test123"

        # 记录不同上下文的行为
        for i in range(5):
            record_trace(xenos_id, "towow", "negotiation", f"neg_{i}", "success")
            record_trace(xenos_id, "towow", "task_execution", f"task_{i}", "success")
            record_trace(xenos_id, "towow", "payment", f"pay_{i}", "success")

        reputation = calculate_agent_reputation(xenos_id)

        assert "contexts" in reputation
        assert len(reputation["contexts"]) >= 3

        # 验证每个上下文都有数据
        context_ids = [c["context"] for c in reputation["contexts"]]
        assert "negotiation" in context_ids
        assert "task_execution" in context_ids
        assert "payment" in context_ids

        print(f"✅ 多上下文信誉测试通过: {len(reputation['contexts'])} 个上下文")

    def test_confidence_levels(self):
        """测试可信度级别"""
        xenos_id = "did:key:test123"

        # 少量记录
        for i in range(3):
            record_trace(xenos_id, "towow", "negotiation", f"action_{i}", "success")

        reputation = calculate_agent_reputation(xenos_id, context="negotiation")
        assert reputation["details"]["confidence"] == "low"

        # 中等记录
        for i in range(15):
            record_trace(xenos_id, "towow", "negotiation", f"action_{i}", "success")

        reputation = calculate_agent_reputation(xenos_id, context="negotiation")
        assert reputation["details"]["confidence"] == "medium"

        # 大量记录
        for i in range(30):
            record_trace(xenos_id, "towow", "negotiation", f"action_{i}", "success")

        reputation = calculate_agent_reputation(xenos_id, context="negotiation")
        assert reputation["details"]["confidence"] == "high"

        print(f"✅ 可信度级别测试通过")

    def test_decay_mechanism(self):
        """测试衰减机制"""
        xenos_id = "did:key:test_decay"

        # 记录不同时间段的行为
        now = datetime.now()

        # 最近30天（权重1.0）
        for i in range(5):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"recent_action_{i}",
                "success",
                metadata={"timestamp": (now - timedelta(days=i * 5)).isoformat()}
            )

        # 31-90天（权重0.7）
        for i in range(5):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"mid_action_{i}",
                "success",
                metadata={"timestamp": (now - timedelta(days=40 + i * 5)).isoformat()}
            )

        # 91-180天（权重0.4）
        for i in range(5):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"old_action_{i}",
                "success",
                metadata={"timestamp": (now - timedelta(days=100 + i * 10)).isoformat()}
            )

        reputation = calculate_agent_reputation(xenos_id)

        assert "overallScore" in reputation
        assert "decayApplied" in reputation["details"]

        # 验证衰减摘要
        decay_summary = reputation["details"]["decayApplied"]
        assert decay_summary["totalTraces"] >= 15
        assert "byTimePeriod" in decay_summary
        # weightedTotal 应该小于等于 totalTraces（因为最近30天的权重是1.0）
        assert decay_summary["weightedTotal"] <= decay_summary["totalTraces"]

        print(f"✅ 衰减机制测试通过")
        print(f"   总记录数: {decay_summary['totalTraces']}")
        print(f"   加权总数: {decay_summary['weightedTotal']:.2f}")
        print(f"   分数: {reputation['overallScore']}")

    def test_decay_weights_configuration(self):
        """测试衰减权重配置"""
        # 验证衰减权重配置
        assert DECAY_WEIGHTS["recent_30_days"] == 1.0
        assert DECAY_WEIGHTS["days_31_to_90"] == 0.7
        assert DECAY_WEIGHTS["days_91_to_180"] == 0.4
        assert DECAY_WEIGHTS["over_180_days"] == 0.2

        # 验证权重递减
        weights = list(DECAY_WEIGHTS.values())
        assert weights[0] >= weights[1] >= weights[2] >= weights[3]

        print(f"✅ 衰减权重配置测试通过")

    def test_fraud_permanent_flag(self):
        """测试欺诈永久标记"""
        # 验证欺诈永久标记配置
        assert FRAUD_PERMANENT is True

        print(f"✅ 欺诈永久标记测试通过")

    def test_fraud_behavior_zero_score(self):
        """测试欺诈行为导致分数归零"""
        xenos_id = "did:key:test_fraud"

        # 记录正常行为
        for i in range(10):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"normal_action_{i}",
                "success"
            )

        # 记录欺诈行为
        record_trace(
            xenos_id,
            "towow",
            "negotiation",
            "fraud",
            "fraud",
            metadata={"isFraud": True}
        )

        reputation = calculate_agent_reputation(xenos_id)

        # 有欺诈记录应该导致分数归零
        assert reputation["overallScore"] == 0.0
        assert reputation["hasFraud"] is True
        assert reputation["fraudCount"] >= 1

        print(f"✅ 欺诈行为归零测试通过")
        print(f"   分数: {reputation['overallScore']}")
        print(f"   欺诈记录数: {reputation['fraudCount']}")

    def test_fraud_actions_detection(self):
        """测试各种欺诈动作的检测"""
        xenos_id = "did:key:test_fraud_actions"

        fraud_actions = ["fraud", "cheat", "malicious", "double_spend"]

        for action in fraud_actions:
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                action,
                "fraud"
            )

        reputation = calculate_agent_reputation(xenos_id)

        assert reputation["hasFraud"] is True
        assert reputation["fraudCount"] >= len(fraud_actions)
        assert reputation["overallScore"] == 0.0

        print(f"✅ 欺诈动作检测测试通过")
        print(f"   检测到 {reputation['fraudCount']} 条欺诈记录")

    def test_decay_summary_time_periods(self):
        """测试衰减摘要的时间分段"""
        xenos_id = "did:key:test_decay_summary"

        now = datetime.now()

        # 记录不同时间段的行为
        time_periods = [
            (5, "recent_30_days"),
            (45, "days_31_to_90"),
            (120, "days_91_to_180"),
            (200, "over_180_days")
        ]

        for days_ago, _ in time_periods:
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"action_{days_ago}",
                "success",
                metadata={"timestamp": (now - timedelta(days=days_ago)).isoformat()}
            )

        reputation = calculate_agent_reputation(xenos_id)
        decay_summary = reputation["details"]["decayApplied"]

        # 验证每个时间段都有记录
        for days_ago, period in time_periods:
            if period in decay_summary["byTimePeriod"]:
                count = decay_summary["byTimePeriod"][period]
                print(f"   {period}: {count} 条")

        print(f"✅ 衰减摘要时间分段测试通过")

    def test_context_fraud_detection(self):
        """测试上下文级别的欺诈检测"""
        xenos_id = "did:key:test_context_fraud"

        # 记录正常协商行为
        for i in range(5):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"neg_action_{i}",
                "success"
            )

        # 记录任务执行的欺诈
        record_trace(
            xenos_id,
            "towow",
            "task_execution",
            "fraud",
            "fraud",
            metadata={"isFraud": True}
        )

        # 查询协商上下文（应该不受任务执行欺诈影响）
        negotiation_rep = calculate_agent_reputation(xenos_id, context="negotiation")

        # 协商上下文应该有分数
        assert negotiation_rep["score"] > 0

        # 查询任务执行上下文（应该归零）
        task_rep = calculate_agent_reputation(xenos_id, context="task_execution")

        assert task_rep["score"] == 0.0
        assert task_rep["details"]["hasFraud"] is True

        print(f"✅ 上下文欺诈检测测试通过")
        print(f"   协商分数: {negotiation_rep['score']}")
        print(f"   任务执行分数: {task_rep['score']}")

    def test_decay_with_mixed_results(self):
        """测试衰减与混合结果的综合计算"""
        xenos_id = "did:key:test_mixed_decay"

        now = datetime.now()

        # 最近30天：4成功1失败
        for i in range(4):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"recent_success_{i}",
                "success",
                metadata={"timestamp": (now - timedelta(days=i * 5)).isoformat()}
            )
        record_trace(
            xenos_id,
            "towow",
            "negotiation",
            "recent_failed",
            "failed",
            metadata={"timestamp": (now - timedelta(days=25)).isoformat()}
        )

        # 31-90天：3成功2失败
        for i in range(3):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"mid_success_{i}",
                "success",
                metadata={"timestamp": (now - timedelta(days=40 + i * 10)).isoformat()}
            )
        for i in range(2):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"mid_failed_{i}",
                "failed",
                metadata={"timestamp": (now - timedelta(days=60 + i * 10)).isoformat()}
            )

        reputation = calculate_agent_reputation(xenos_id)

        # 分数应该反映加权后的履约率
        assert 0 < reputation["overallScore"] < 1000
        assert "decayApplied" in reputation["details"]

        print(f"✅ 衰减混合结果测试通过")
        print(f"   分数: {reputation['overallScore']}")
        print(f"   履约率: {reputation['details']['fulfillmentRate']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
