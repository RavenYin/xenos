"""Xenos 核心模块初始化"""
from .identity import (
    generate_xenos_id,
    verify_xenos_signature,
    sign_message,
    create_verifiable_credential,
    get_agent_reputation
)
from .trace import (
    record_trace,
    get_agent_traces,
    query_traces,
    get_trace_statistics,
    clear_local_traces
)
from .context import (
    get_context_service,
    ContextService
)
from .reputation import (
    get_reputation_service,
    ReputationService,
    calculate_agent_reputation
)

__all__ = [
    # Identity Service
    "generate_xenos_id",
    "verify_xenos_signature",
    "sign_message",
    "create_verifiable_credential",
    "get_agent_reputation",
    # Trace Service
    "record_trace",
    "get_agent_traces",
    "query_traces",
    "get_trace_statistics",
    "clear_local_traces",
    # Context Service
    "get_context_service",
    "ContextService",
    # Reputation Service
    "get_reputation_service",
    "ReputationService",
    "calculate_agent_reputation"
]
