# Xenos - SecondMe OAuth 集成项目

## 项目概述

本项目是一个集成 SecondMe OAuth 登录和个人信息获取的网站应用。

## 技术栈

- **前端**: Next.js 14 (App Router)
- **认证**: NextAuth.js
- **数据库**: PostgreSQL + Prisma ORM
- **样式**: Tailwind CSS
- **API 集成**: SecondMe API

## SecondMe API 配置

### 端点

- API 基础 URL: `https://app.mindos.com/gate/lab`
- OAuth 授权 URL: `https://go.second.me/oauth/`

### Scopes

| Scope | 说明 |
|-------|------|
| `user.info` | 用户基础信息 |
| `user.info.shades` | 用户兴趣标签 |
| `user.info.softmemory` | 用户软记忆 |
| `note.add` | 添加笔记 |
| `chat` | 聊天功能 |

## OAuth 流程

1. 用户点击登录 → 跳转 SecondMe 授权页面
2. 用户授权 → 重定向回应用（带 authorization_code）
3. 后端用 code 换取 access_token 和 refresh_token
4. 使用 access_token 调用 SecondMe API

## API 响应格式

所有 SecondMe API 响应都遵循统一格式：

```json
{
  "code": 0,
  "data": { ... }
}
```

前端必须正确提取 `data` 字段内的数据。

## 开发指南

### 启动开发服务器

```bash
npm install
npx prisma db push
npm run dev
```

### 环境变量

在 `.env.local` 中配置：

```
SECONDME_CLIENT_ID=your_client_id
SECONDME_CLIENT_SECRET=your_client_secret
SECONDME_REDIRECT_URI=http://localhost:3000/api/auth/callback/secondme
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xenos
```

## 设计原则

- **亮色主题**: 仅使用浅色主题
- **简约优雅**: 极简设计，减少视觉噪音
- **中文界面**: 所有用户可见文字使用中文
- **稳定优先**: 避免复杂动画，仅用简单过渡效果
