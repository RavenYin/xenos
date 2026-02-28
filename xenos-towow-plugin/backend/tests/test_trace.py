"""Xenos 行为记录测试"""
import pytest
from app.xenos.trace import (
    record_trace,
    get_agent_traces,
    query_traces,
    get_trace_statistics,
    clear_local_traces
)


class TestTraceService:
    """行为记录服务测试"""

    def setup_method(self):
        """每个测试前清除本地数据"""
        clear_local_traces()

    def test_record_trace(self):
        """测试记录行为"""
        xenos_id = "did:key:test123"

        result = record_trace(
            xenos_id=xenos_id,
            network="towow",
            context="negotiation",
            action="accept_demand",
            result="success",
            metadata={"demandId": "test_demand_001"}
        )

        assert result["success"] is True
        assert "traceId" in result

        print(f"✅ 行为记录成功: {result.get('traceId')}")

    def test_get_traces(self):
        """测试获取行为记录"""
        xenos_id = "did:key:test123"

        # 先记录一些行为
        record_trace(xenos_id, "towow", "negotiation", "accept_demand", "success")
        record_trace(xenos_id, "towow", "task_execution", "start_task", "success")
        record_trace(xenos_id, "towow", "negotiation", "submit_proposal", "failed")

        # 获取记录
        result = get_agent_traces(xenos_id, limit=5)

        assert "traces" in result
        assert len(result["traces"]) >= 3

        print(f"✅ 获取到 {len(result['traces'])} 条记录")

    def test_get_traces_limit(self):
        """测试获取记录数量限制"""
        xenos_id = "did:key:test123"

        # 记录多条行为
        for i in range(10):
            record_trace(
                xenos_id,
                "towow",
                "negotiation",
                f"action_{i}",
                "success"
            )

        # 获取限制数量的记录
        result = get_agent_traces(xenos_id, limit=5)

        assert "traces" in result
        assert len(result["traces"]) <= 5

        print(f"✅ 限制数量测试通过: {len(result['traces'])} 条")

    def test_record_with_empty_xenos_id(self):
        """测试空 Xenos ID"""
        result = record_trace(
            xenos_id="",
            network="towow",
            context="negotiation",
            action="test",
            result="success"
        )

        # 空的 xenos_id 也可以记录（由调用方决定是否拒绝）
        assert result["success"] is True

        print(f"✅ 空 ID 测试通过")

    def test_query_traces_by_context(self):
        """测试按上下文查询"""
        xenos_id = "did:key:test123"

        # 记录不同上下文的行为
        record_trace(xenos_id, "towow", "negotiation", "accept_demand", "success")
        record_trace(xenos_id, "towow", "task_execution", "start_task", "success")
        record_trace(xenos_id, "towow", "negotiation", "submit_proposal", "failed")

        # 查询特定上下文
        result = query_traces(xenos_id=xenos_id, context="negotiation")

        assert "traces" in result
        for trace in result["traces"]:
            assert trace["context"] == "negotiation"

        print(f"✅ 按上下文查询测试通过")

    def test_query_traces_by_result(self):
        """测试按结果查询"""
        xenos_id = "did:key:test123"

        # 记录不同结果的行为
        record_trace(xenos_id, "towow", "negotiation", "action1", "success")
        record_trace(xenos_id, "towow", "negotiation", "action2", "success")
        record_trace(xenos_id, "towow", "negotiation", "action3", "failed")

        # 查询成功的结果
        result = query_traces(xenos_id=xenos_id, result="success")

        assert "traces" in result
        for trace in result["traces"]:
            assert trace["result"] == "success"

        print(f"✅ 按结果查询测试通过")

    def test_get_trace_statistics(self):
        """测试获取统计信息"""
        xenos_id = "did:key:test123"

        # 记录行为
        record_trace(xenos_id, "towow", "negotiation", "action1", "success")
        record_trace(xenos_id, "towow", "negotiation", "action2", "success")
        record_trace(xenos_id, "towow", "task_execution", "action3", "success")
        record_trace(xenos_id, "towow", "negotiation", "action4", "failed")

        # 获取统计
        result = get_trace_statistics(xenos_id)

        assert "totalTraces" in result
        assert result["totalTraces"] == 4
        assert "fulfillmentRate" in result
        assert result["fulfillmentRate"] == 0.75  # 3/4 = 0.75
        assert "contextStats" in result

        print(f"✅ 统计信息测试通过")

    def test_clear_local_traces(self):
        """测试清除本地记录"""
        xenos_id = "did:key:test123"

        # 记录行为
        record_trace(xenos_id, "towow", "negotiation", "action", "success")

        # 验证记录存在
        result_before = get_agent_traces(xenos_id)
        assert len(result_before["traces"]) == 1

        # 清除记录
        clear_result = clear_local_traces(xenos_id)
        assert clear_result["success"] is True
        assert clear_result["cleared"] == 1

        # 验证记录已清除
        result_after = get_agent_traces(xenos_id)
        assert len(result_after["traces"]) == 0

        print(f"✅ 清除记录测试通过")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
