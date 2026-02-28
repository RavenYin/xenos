"""Xenos Trace Service - 记录 Agent 在网络中的行为痕迹"""
from typing import Optional, Dict, Any, List
from datetime import datetime
import httpx
import threading


XENOS_API_BASE = "http://localhost:3000/api/v1"

# 本地内存存储（用于演示和测试）
_local_traces: Dict[str, List[Dict[str, Any]]] = {}
_local_lock = threading.Lock()


def record_trace(
    xenos_id: str,
    network: str,
    context: str,
    action: str,
    result: str,
    metadata: Optional[Dict[str, Any]] = None
) -> dict:
    """
    记录行为到 Xenos 服务

    Args:
        xenos_id: Xenos ID
        network: 网络名称（towow）
        context: 上下文类型
        action: 动作类型
        result: 结果（success/failed/cancelled）
        metadata: 额外元数据

    Returns:
        记录结果
    """
    try:
        # 生成 trace ID
        trace_id = f"trace_{datetime.now().timestamp()}_{hash(xenos_id + action) % 10000}"

        payload = {
            "xenosId": xenos_id,
            "network": network,
            "context": context,
            "action": action,
            "result": result,
            "metadata": {
                **(metadata or {}),
                "timestamp": datetime.now().isoformat()
            }
        }

        # 尝试发送到 Xenos 服务
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.post(f"{XENOS_API_BASE}/trace/record", json=payload)

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "traceId": data["data"].get("traceId", trace_id),
                        "recorded": True
                    }
        except Exception as e:
            print(f"[Trace Service] Xenos API error: {e}")

        # 如果 Xenos 服务不可用，记录到本地
        with _local_lock:
            if xenos_id not in _local_traces:
                _local_traces[xenos_id] = []

            trace_record = {
                "id": trace_id,
                "xenosId": xenos_id,
                "network": network,
                "context": context,
                "action": action,
                "result": result,
                "metadata": payload["metadata"],
                "timestamp": datetime.now().isoformat(),
                "synced": False
            }

            _local_traces[xenos_id].append(trace_record)
            # 保持最多 1000 条记录
            if len(_local_traces[xenos_id]) > 1000:
                _local_traces[xenos_id] = _local_traces[xenos_id][-1000:]

        return {
            "success": True,
            "traceId": trace_id,
            "recorded": True,
            "notice": "Recorded locally (Xenos service unavailable)"
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to record trace: {str(e)}"
        }


def get_agent_traces(xenos_id: str, limit: int = 10) -> dict:
    """
    获取 Agent 行为记录

    Args:
        xenos_id: Xenos ID
        limit: 返回记录数量限制

    Returns:
        行为记录列表
    """
    try:
        # 尝试从 Xenos 服务获取
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(
                    f"{XENOS_API_BASE}/trace/query",
                    params={
                        "xenosId": xenos_id,
                        "limit": limit
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    return data["data"]
        except Exception as e:
            print(f"[Trace Service] Xenos API error: {e}")

        # 从本地存储返回
        with _local_lock:
            traces = _local_traces.get(xenos_id, []).copy()

        # 按时间倒序排列
        traces.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        # 应用限制
        traces = traces[:limit]

        return {
            "xenosId": xenos_id,
            "traces": traces,
            "total": len(_local_traces.get(xenos_id, [])),
            "source": "local"
        }

    except Exception as e:
        return {
            "xenosId": xenos_id,
            "error": f"Failed to get traces: {str(e)}"
        }


def query_traces(
    xenos_id: Optional[str] = None,
    network: Optional[str] = None,
    context: Optional[str] = None,
    action: Optional[str] = None,
    result: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = 100
) -> dict:
    """
    查询行为记录（高级查询）

    Args:
        xenos_id: Xenos ID
        network: 网络名称
        context: 上下文类型
        action: 动作类型
        result: 结果
        start_time: 开始时间（ISO 格式）
        end_time: 结束时间（ISO 格式）
        limit: 返回记录数量限制

    Returns:
        查询结果
    """
    try:
        # 收集所有 traces
        all_traces = []

        if xenos_id:
            # 查询特定 agent 的 traces
            result_data = get_agent_traces(xenos_id, limit=limit * 10)
            all_traces = result_data.get("traces", [])
        else:
            # 查询所有 traces
            with _local_lock:
                for traces in _local_traces.values():
                    all_traces.extend(traces)

        # 应用过滤条件
        filtered_traces = all_traces

        if network:
            filtered_traces = [t for t in filtered_traces if t.get("network") == network]

        if context:
            filtered_traces = [t for t in filtered_traces if t.get("context") == context]

        if action:
            filtered_traces = [t for t in filtered_traces if t.get("action") == action]

        if result:
            filtered_traces = [t for t in filtered_traces if t.get("result") == result]

        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            filtered_traces = [
                t for t in filtered_traces
                if datetime.fromisoformat(t.get("timestamp", "")) >= start_dt
            ]

        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            filtered_traces = [
                t for t in filtered_traces
                if datetime.fromisoformat(t.get("timestamp", "")) <= end_dt
            ]

        # 按时间倒序排列
        filtered_traces.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        # 应用限制
        filtered_traces = filtered_traces[:limit]

        return {
            "traces": filtered_traces,
            "total": len(filtered_traces),
            "query": {
                "xenosId": xenos_id,
                "network": network,
                "context": context,
                "action": action,
                "result": result,
                "startTime": start_time,
                "endTime": end_time,
                "limit": limit
            }
        }

    except Exception as e:
        return {
            "error": f"Failed to query traces: {str(e)}",
            "query": {
                "xenosId": xenos_id,
                "limit": limit
            }
        }


def get_trace_statistics(xenos_id: str) -> dict:
    """
    获取 Agent 的行为统计

    Args:
        xenos_id: Xenos ID

    Returns:
        统计信息
    """
    try:
        traces_result = get_agent_traces(xenos_id, limit=1000)
        traces = traces_result.get("traces", [])

        # 统计各上下文的行为
        context_stats = {}
        action_stats = {}
        result_stats = {"success": 0, "failed": 0, "cancelled": 0}

        for trace in traces:
            context = trace.get("context", "unknown")
            action = trace.get("action", "unknown")
            result = trace.get("result", "unknown")

            # 统计上下文
            if context not in context_stats:
                context_stats[context] = {"count": 0, "success": 0, "failed": 0}
            context_stats[context]["count"] += 1
            if result == "success":
                context_stats[context]["success"] += 1
            elif result == "failed":
                context_stats[context]["failed"] += 1

            # 统计动作
            if action not in action_stats:
                action_stats[action] = 0
            action_stats[action] += 1

            # 统计结果
            if result in result_stats:
                result_stats[result] += 1

        # 计算总体履约率
        total_success = result_stats["success"]
        total_failed = result_stats["failed"]
        total_actions = total_success + total_failed
        fulfillment_rate = total_success / total_actions if total_actions > 0 else 0.5

        return {
            "xenosId": xenos_id,
            "totalTraces": len(traces),
            "fulfillmentRate": round(fulfillment_rate, 4),
            "contextStats": context_stats,
            "actionStats": action_stats,
            "resultStats": result_stats
        }

    except Exception as e:
        return {
            "xenosId": xenos_id,
            "error": f"Failed to get statistics: {str(e)}"
        }


def clear_local_traces(xenos_id: Optional[str] = None) -> dict:
    """
    清除本地存储的 traces（用于测试）

    Args:
        xenos_id: Xenos ID（None 表示清除所有）

    Returns:
        清除结果
    """
    try:
        with _local_lock:
            if xenos_id:
                count = len(_local_traces.get(xenos_id, []))
                _local_traces[xenos_id] = []
                return {
                    "success": True,
                    "cleared": count,
                    "xenosId": xenos_id
                }
            else:
                total = sum(len(traces) for traces in _local_traces.values())
                _local_traces.clear()
                return {
                    "success": True,
                    "cleared": total,
                    "xenosId": "all"
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
