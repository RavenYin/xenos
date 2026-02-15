# 信契 - SecondMe 集成项目

## 📋 项目信息

- **应用名称**: 信契 (Xenos)
- **描述**: 链接 SecondMe 和 ToWow 的信任协议应用
- **版本**: 0.1.0

## 🔐 SecondMe 配置

### API 凭证
- **Client ID**: 79127965-7c40-4609-9862-15933fa9712e
- **Client Secret**: 9e4dc0a90f0292be2ce79e5861dae535a323ae78ec6cdb8c7a4a18c628493870
- **API Endpoint**: https://api.second.me

### 已选模块
- ✅ **auth** - OAuth 2.0 登录认证
- ✅ **profile** - 获取和管理个人信息

## 📦 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js v5 (Beta) with SecondMe provider
- **样式**: Tailwind CSS
- **设计系统**: 极简亮色主题，中文界面

## 🗂️ 项目结构

```
xenos/
├── .secondme/           # SecondMe 配置（勿提交到 Git）
│   └── state.json       # 项目状态文件
├── prisma/
│   ├── schema.prisma    # 数据库模型
│   └── migrations/      # 迁移文件
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── route.ts     # NextAuth 端点
│   │   │   ├── secondme/
│   │   │   └── profile/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/           # 通用 UI 组件
│   │   ├── ProfileCard.tsx
│   │   └── LoginButton.tsx
│   └── lib/
│       ├── secondme.ts   # SecondMe API 客户端
│       └── auth.ts       # 认证配置
├── .env.local            # 环境变量（自动生成）
└── package.json
```

## 🚀 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置数据库**
   ```bash
   # 创建 PostgreSQL 数据库
   createdb xenos

   # 生成迁移并推送
   npx prisma db push
   ```

3. **开发环境**
   ```bash
   npm run dev
   # 访问 http://localhost:3000
   ```

## 🔑 环境变量 (.env.local)

自动生成的文件将包含：

```env
# SecondMe
SECONDME_CLIENT_ID=79127965-7c40-4609-9862-15933fa9712e
SECONDME_CLIENT_SECRET=9e4dc0a90f0292be2ce79e5861dae535a323ae78ec6cdb8c7a4a18c628493870
SECONDME_ENDPOINT=https://api.second.me

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xenos"
```

## 📊 数据库模型

### User 表（必含）
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  image         String?
  secondMeId    String    @unique  // SecondMe 用户 ID
  accessToken   String    // 用于调用 SecondMe API
  refreshToken  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## 🧩 Core Features

### 1. OAuth 登录
- 点击「使用 SecondMe 登录」按钮
- 跳转到 SecondMe 授权页面
- 授权后返回网站，自动创建/更新用户记录

### 2. 个人信息展示
- 显示 SecondMe 头像、昵称、邮箱
- 获取并展示用户 profile 中的自定义字段
- 数据实时从 SecondMe API 获取

## 🔗 与 ToWow 集成

未来扩展方向：
- 用户在 ToWow 中的 Agent 身份关联
- 基于 SecondMe profile 的信任评分
- 向 ToWow 提交可验证凭证

## 📚 开发文档

详细的设计文档、API 说明和集成方案保存在：
`E:/Obsidian/信契/`

包括：
- 轻量级 MVP 计划书
- 技术架构设计
- API 接口文档
- 与 ToWow 集成方案

## ⚠️ 注意事项

- **.secondme/ 目录包含敏感配置，必须添加到 .gitignore**
- PostgreSQL 数据库需要预先安装并运行
- NextAuth v5 仍处于 Beta，使用前阅读官方文档
- 生产环境需要配置 HTTPS 和域名

## 🐛 已知问题

- SecondMe API 在测试环境可能有 rate limiting
- 用户信息缓存策略待优化

---

**设计原则**: 亮色主题 | 简约优雅 | 中文界面 | 稳定优先

生成时间: 2026-02-13