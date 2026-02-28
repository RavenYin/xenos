"""Xenos 上下文服务测试"""
import pytest
from app.xenos.context import (
    get_context_service,
    ContextService,
    PREDEFINED_CONTEXTS
)


class TestContextService:
    """上下文服务测试"""

    def test_get_predefined_context(self):
        """测试获取预定义上下文"""
        service = get_context_service()

        context = service.get_context("negotiation")

        assert context is not None
        assert context["name"] == "协商"
        assert "actions" in context
        assert "weight" in context

        print(f"✅ 获取预定义上下文测试通过")

    def test_list_contexts(self):
        """测试列出所有上下文"""
        service = get_context_service()

        contexts = service.list_contexts()

        assert len(contexts) > 0
        assert "negotiation" in [c["id"] for c in contexts]
        assert "task_execution" in [c["id"] for c in contexts]

        print(f"✅ 列出上下文测试通过: {len(contexts)} 个上下文")

    def test_create_custom_context(self):
        """测试创建自定义上下文"""
        service = get_context_service()

        context = service.create_custom_context(
            context_id="custom_test",
            name="自定义测试",
            description="这是一个自定义上下文",
            weight=1.5,
            actions=["action1", "action2"]
        )

        assert context["name"] == "自定义测试"
        assert context["weight"] == 1.5
        assert len(context["actions"]) == 2

        # 验证可以获取自定义上下文
        retrieved = service.get_context("custom_test")
        assert retrieved == context

        print(f"✅ 创建自定义上下文测试通过")

    def test_get_action_context(self):
        """测试根据动作查找上下文"""
        service = get_context_service()

        # 测试预定义动作
        context_id = service.get_action_context("accept_demand")
        assert context_id == "negotiation"

        context_id = service.get_action_context("start_task")
        assert context_id == "task_execution"

        # 测试自定义动作
        service.create_custom_context(
            context_id="custom",
            name="Custom",
            description="Test",
            actions=["custom_action"]
        )

        context_id = service.get_action_context("custom_action")
        assert context_id == "custom"

        # 测试不存在的动作
        context_id = service.get_action_context("nonexistent_action")
        assert context_id is None

        print(f"✅ 查找动作上下文测试通过")

    def test_get_context_weight(self):
        """测试获取上下文权重"""
        service = get_context_service()

        weight = service.get_context_weight("negotiation")
        assert weight == 1.0

        weight = service.get_context_weight("payment")
        assert weight == 2.0

        # 自定义上下文
        service.create_custom_context(
            context_id="heavy",
            name="Heavy",
            description="Test",
            weight=3.0
        )

        weight = service.get_context_weight("heavy")
        assert weight == 3.0

        print(f"✅ 获取上下文权重测试通过")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
