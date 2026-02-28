# Xenos Plugin for ToWow

> 为 ToWow Agent 提供统一的 Xenos 身份和场景化信誉

---

## 项目概述

这个插件让使用 ToWow 协商的 Agent 能够：
1. ✅ 自动获得 Xenos 身份（did:key）
2. ✅ 自动记录协商行为到 Xenos 服务
3. ✅ 查询自己的场景化信誉
4. ✅ 在 ToWow 生态中展示 Xenos 信誉

---

## 功能特性

| 功能 | 说明 |
|------|------|
| **Agent 注册** | 自动生成 Xenos ID（did:key） |
| **行为记录** | 自动记录 ToWow 协商过程 |
| **信誉查询** | 查询"你在什么情况下靠谱" |
| **Webhook 集成** | 通过 Webhook 接收 ToWow 事件 |

---

## 快速开始

### 1. 环境准备

```bash
# 安装依赖
pip install -r requirements.txt

# 或使用 poetry
pip install poetry
poetry install

# 复制环境配置
cp .env.example .env
# 编辑 .env 文件，配置你的 Xenos API 地址和 ToWow API 地址
```

### 2. 启动服务

```bash
# 开发模式（自动重载）
python -m uvicorn backend.app.main:app --reload --port 8001

# 生产模式
python -m uvicorn backend.app.main:app --port 8001
```

### 3. 配置 ToWow Webhook

在 ToWow 后台配置 Webhook URL：
```
http://your-domain.com/api/towww/webhooks/toww
```

---

## API 端点

### Xenos API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/xenos/register` | Agent 注册，生成 Xenos ID |
| GET | `/api/xenos/agent/{xenos_id}` | 获取 Agent 信息 |
| POST | `/api/xenos/trace` | 记录行为到 Xenos |
| GET | `/api/xenos/reputation/{xenos_id}` | 查询场景化信誉 |
| GET | `/api/xenos/traces/{xenos_id}` | 查询行为记录 |

### ToWow Agent API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/towwow/agent/register` | ToWow Agent 注册，自动创建 Xenos 身份 |
| GET | `/api/towwow/agent/{xenos_id}` | 获取 ToWow Agent 的 Xenos 信息 |

### ToWow 意图注入 API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/towwow/intent/enrich` | 意图注入，在需求匹配时注入 Xenos 身份和信誉 |

### ToWow 痕迹记录 API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/towwow/trace/record` | 记录 ToWow 行为痕迹 |
| GET | `/api/towwow/trace/{xenos_id}` | 获取 Agent 在 ToWow 中的行为记录 |

### ToWow 信誉查询 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/towwow/reputation/{xenos_id}` | 查询 Agent 在 ToWow 场景的信誉 |
| GET | `/api/towwow/reputation/{xenos_id}/summary` | 获取 Agent 信誉摘要（简化版）|

### ToWow Webhook

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/towwow/webhooks/toww` | 处理 ToWow 回调事件 |

### 健康检查

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/` | 服务信息 |

---

## 项目结构

```
xenos-towow-plugin/
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI 主应用
│   ├── routers/
│   │   ├── __init__.py      # 路由初始化
│   │   ├── health.py         # 健康检查
│   │   ├── xenos.py          # Xenos API 路由
│   │   └── towwow.py        # ToWow Webhook 路由
│   ├── xenos/
│   │   ├── __init__.py      # Xenos 模块初始化
│   │   ├── identity.py       # Xenos ID 生成
│   │   └── trace.py          # 行为记录
│   └── towwow/
│       └── __init__.py      # ToWow 模块初始化
├── tests/
│   ├── test_identity.py
│   ├── test_trace.py
│   └── test_integration.py
├── requirements.txt
├── pyproject.toml
├── .env.example
└── README.md
```

---

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|---------|
| `XENOS_API_BASE` | Xenos API 地址 | `http://localhost:3000/api/v1` |
| `TOWOW_API_BASE` | ToWow API 地址 | `http://localhost:8000` |
| `TOWOW_WEBHOOK_SECRET` | Webhook 签名密钥 | `dev-secret` |
| `LOG_LEVEL` | 日志级别 | `INFO` |

---

## Webhook 事件处理

| 事件 | 处理方式 | 记录的上下文 |
|------|---------|-------------|
| `demand_accepted` | 记录 `accept_demand` | negotiation |
| `proposal_submitted` | 记录 `submit_proposal` | negotiation |
| `run_completed` | 记录 `complete_negotiation` | negotiation |
| `run_failed` | 记录失败 | negotiation |
| `task_started` | 记录 `start_task` | task_execution |
| `task_completed` | 记录 `complete_task` | task_execution |

---

## 开发指南

### 运行测试

```bash
# 运行所有测试
pytest tests/

# 运行特定测试文件
pytest tests/test_identity.py
```

### 代码风格

项目使用 Black 和 isort 进行代码格式化：

```bash
# 格式化代码
black backend/
isort backend/
```

---

## 部署

### 使用 Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 使用 Docker 部署

```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# 构建和运行
docker build -t xenos-towow-plugin .
docker run -p 8001:8001 xenos-towow-plugin
```

---

## 故障排除

### Xenos 服务不可用

如果 Xenos API 不可用，插件会记录日志但不会阻止 ToWow 正常运行。

### Webhook 签名验证失败

默认情况下签名验证是模拟的，实际部署时需要配置 ToWow 的公钥。

---

## 许可证

MIT License

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 联系方式

- GitHub: [项目地址]
- Email: team@xenos.dev
