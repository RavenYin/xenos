"""集成测试：Xenos + ToWow 模拟"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.xenos.trace import record_trace, clear_local_traces


@pytest.fixture
def client():
    """测试客户端"""
    return TestClient(app)


@pytest.fixture(autouse=True)
def cleanup():
    """每个测试后清理"""
    clear_local_traces()
    yield
    clear_local_traces()


class TestAPIIntegration:
    """API 集成测试"""

    def test_health_check(self, client):
        """测试健康检查"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "service" in data

        print(f"✅ 健康检查测试通过")

    def test_root_endpoint(self, client):
        """测试根端点"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data

        print(f"✅ 根端点测试通过")

    def test_register_agent_flow(self, client):
        """测试完整的 Agent 注册流程"""
        response = client.post("/api/xenos/register", json={
            "agentName": "Integration Test Agent"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert "xenosId" in data["data"]
        assert "privateKey" in data["data"]
        assert "didDocument" in data["data"]

        print(f"✅ Agent 注册测试通过")
        print(f"   Agent ID: {data['data'].get('agentId', 'N/A')}")
        print(f"   Xenos ID: {data['data']['xenosId']}")

    def test_get_agent(self, client):
        """测试获取 Agent 信息"""
        # 先注册一个 agent
        register_response = client.post("/api/xenos/register", json={
            "agentName": "Test Agent"
        })
        xenos_id = register_response.json()["data"]["xenosId"]

        # 获取 agent 信息
        response = client.get(f"/api/xenos/agent/{xenos_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"]["xenosId"] == xenos_id

        print(f"✅ 获取 Agent 信息测试通过")

    def test_trace_recording(self, client):
        """测试行为记录"""
        response = client.post("/api/xenos/trace", json={
            "xenosId": "did:key:integration_test",
            "network": "towow",
            "context": "negotiation",
            "action": "accept_demand",
            "result": "success",
            "metadata": {"demandId": "integration_test_001"}
        })

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data

        print(f"✅ 行为记录测试通过")
        print(f"   Trace ID: {data['data'].get('traceId', 'N/A')}")

    def test_get_traces(self, client):
        """测试获取行为记录"""
        # 先记录一些行为
        for i in range(5):
            client.post("/api/xenos/trace", json={
                "xenosId": "did:key:test_traces",
                "network": "towow",
                "context": "negotiation",
                "action": f"action_{i}",
                "result": "success"
            })

        # 获取记录
        response = client.get("/api/xenos/traces/did:key:test_traces?limit=10")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert "traces" in data["data"]
        assert len(data["data"]["traces"]) <= 10

        print(f"✅ 获取行为记录测试通过: {len(data['data']['traces'])} 条")

    def test_toww_webhook(self, client):
        """测试 ToWow Webhook"""
        webhook_payload = {
            "eventType": "demand_accepted",
            "data": {
                "agentXenosId": "did:key:integration_test",
                "demandId": "webhook_test_001",
                "success": True
            }
        }

        response = client.post(
            "/api/towwow/webhooks/toww",
            json=webhook_payload,
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0

        print(f"✅ ToWow Webhook 测试通过")

    def test_reputation_query(self, client):
        """测试信誉查询"""
        # 记录一些行为
        for i in range(10):
            client.post("/api/xenos/trace", json={
                "xenosId": "did:key:reputation_test",
                "network": "towow",
                "context": "negotiation",
                "action": f"action_{i}",
                "result": "success" if i < 8 else "failed"
            })

        # 查询信誉
        response = client.get("/api/xenos/reputation/did:key:reputation_test?context=negotiation")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data

        print(f"✅ 信誉查询测试通过")
        print(f"   Score: {data['data'].get('score', 'N/A')}")

    def test_toww_demo_endpoint(self, client):
        """测试 ToWow 演示端点"""
        response = client.get("/api/towwow/demo")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert "agentName" in data["data"]

        print(f"✅ ToWow 演示端点测试通过")

    def test_complete_workflow(self, client):
        """测试完整工作流程"""
        # 1. 注册 Agent
        register_resp = client.post("/api/xenos/register", json={
            "agentName": "Workflow Test Agent"
        })
        xenos_id = register_resp.json()["data"]["xenosId"]

        # 2. 记录协商行为
        client.post("/api/xenos/trace", json={
            "xenosId": xenos_id,
            "network": "towow",
            "context": "negotiation",
            "action": "accept_demand",
            "result": "success"
        })

        # 3. 记录任务执行行为
        client.post("/api/xenos/trace", json={
            "xenosId": xenos_id,
            "network": "towow",
            "context": "task_execution",
            "action": "start_task",
            "result": "success"
        })

        # 4. 查询信誉
        rep_resp = client.get(f"/api/xenos/reputation/{xenos_id}")
        reputation = rep_resp.json()["data"]

        # 5. 获取行为记录
        traces_resp = client.get(f"/api/xenos/traces/{xenos_id}")
        traces = traces_resp.json()["data"]["traces"]

        assert reputation["overallScore"] > 500
        assert len(traces) >= 2

        print(f"✅ 完整工作流程测试通过")
        print(f"   Xenos ID: {xenos_id}")
        print(f"   Score: {reputation['overallScore']}")
        print(f"   Traces: {len(traces)}")

    def test_towwow_agent_register(self, client):
        """测试 ToWow Agent 注册"""
        response = client.post("/api/towwow/agent/register", json={
            "agentName": "ToWow Test Agent",
            "agentType": "towow-agent",
            "capabilities": ["negotiation", "task-execution", "payment"]
        })

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert data["data"]["xenosId"].startswith("did:key:")
        assert data["data"]["network"] == "towow"

        print(f"✅ ToWow Agent 注册测试通过")

    def test_towwow_get_agent_info(self, client):
        """测试获取 ToWow Agent 信息"""
        # 先注册
        register_resp = client.post("/api/towwow/agent/register", json={
            "agentName": "Agent Info Test"
        })
        xenos_id = register_resp.json()["data"]["xenosId"]

        # 获取信息
        response = client.get(f"/api/towwow/agent/{xenos_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"]["xenosId"] == xenos_id
        assert "reputation" in data["data"]
        assert "recentTraces" in data["data"]

        print(f"✅ 获取 ToWow Agent 信息测试通过")

    def test_towwow_intent_enrich(self, client):
        """测试意图注入"""
        xenos_id = "did:key:intent_enrich_test"

        # 先记录一些行为
        for i in range(5):
            client.post("/api/xenos/trace", json={
                "xenosId": xenos_id,
                "network": "towow",
                "context": "negotiation",
                "action": f"action_{i}",
                "result": "success"
            })

        # 意图注入
        response = client.post("/api/towwow/intent/enrich", json={
            "agentXenosId": xenos_id,
            "intent": {"task": "execute_task", "requirements": ["skill1", "skill2"]},
            "context": "negotiation"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert "enrichedIntent" in data["data"]
        assert "xenos" in data["data"]["enrichedIntent"]
        assert "reputation" in data["data"]["enrichedIntent"]["xenos"]

        print(f"✅ 意图注入测试通过")

    def test_towwow_record_trace(self, client):
        """测试 ToWow 痕迹记录"""
        response = client.post("/api/towwow/trace/record", json={
            "agentXenosId": "did:key:trace_record_test",
            "eventType": "demand_accepted",
            "demandId": "demand_001",
            "runId": "run_001",
            "success": True,
            "context": "negotiation",
            "action": "accept_demand"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert data["data"]["success"] is True

        print(f"✅ ToWow 痕迹记录测试通过")

    def test_towwow_get_traces(self, client):
        """测试获取 ToWow 痕迹"""
        xenos_id = "did:key:towwow_traces_test"

        # 记录一些行为
        for i in range(5):
            client.post("/api/towwow/trace/record", json={
                "agentXenosId": xenos_id,
                "eventType": f"event_{i}",
                "success": True,
                "context": "negotiation",
                "action": f"action_{i}"
            })

        # 获取痕迹
        response = client.get(f"/api/towwow/trace/{xenos_id}?limit=10")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert "traces" in data["data"]

        print(f"✅ 获取 ToWow 痕迹测试通过")

    def test_towwow_get_reputation(self, client):
        """测试获取 ToWow 信誉"""
        xenos_id = "did:key:towwow_rep_test"

        # 记录行为
        for i in range(8):
            client.post("/api/towwow/trace/record", json={
                "agentXenosId": xenos_id,
                "eventType": "task_completed",
                "success": True,
                "context": "task_execution",
                "action": "complete_task"
            })

        # 获取信誉
        response = client.get(f"/api/towwow/reputation/{xenos_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert data["data"]["xenosId"] == xenos_id
        assert data["data"]["network"] == "towow"

        print(f"✅ 获取 ToWow 信誉测试通过")

    def test_towwow_get_reputation_summary(self, client):
        """测试获取信誉摘要"""
        xenos_id = "did:key:rep_summary_test"

        # 记录行为
        for i in range(5):
            client.post("/api/towwow/trace/record", json={
                "agentXenosId": xenos_id,
                "eventType": "event",
                "success": True,
                "context": "negotiation",
                "action": "action"
            })

        # 获取摘要
        response = client.get(f"/api/towwow/reputation/{xenos_id}/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "data" in data
        assert "overallScore" in data["data"]
        assert "fulfillmentRate" in data["data"]
        assert "contextSummary" in data["data"]

        print(f"✅ 获取信誉摘要测试通过")

    def test_towwow_mock_sync_traces(self, client):
        """测试模拟同步 traces"""
        response = client.get("/api/towwow/mock/sync-traces")

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "xenosId" in data
        assert "tracesCount" in data

        print(f"✅ 模拟同步 traces 测试通过")


@pytest.mark.asyncio
class TestAsyncIntegration:
    """异步集成测试"""

    async def test_end_to_end_flow(self):
        """端到端集成测试流程"""
        print("🧪 运行端到端集成测试...")

        # 1. 模拟 Agent 注册
        # 2. 模拟协商行为记录
        # 3. 模拟任务执行记录
        # 4. 模拟信誉查询

        print("✅ 端到端测试框架就绪")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
