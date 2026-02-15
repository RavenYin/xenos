# 信契 (Xenos)

一个链接 SecondMe 和 ToWow 的信任协议应用，提供 OAuth 2.0 登录和个人信息获取功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js v5 (Beta) with SecondMe OAuth2
- **样式**: Tailwind CSS

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填写你的 SecondMe 凭证和数据库连接：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# SecondMe
SECONDME_CLIENT_ID=your-client-id
SECONDME_CLIENT_SECRET=your-client-secret
SECONDME_ENDPOINT=https://api.second.me

# NextAuth
NEXTAUTH_SECRET=generate-a-secure-secret
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/xenos"
```

### 3. 配置数据库

```bash
npx prisma generate
npx prisma db push
```

确保 PostgreSQL 服务已启动，并创建名为 `xenos` 的数据库（或修改 `DATABASE_URL` 指向现有数据库）。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)，点击「使用 SecondMe 登录」按钮体验。

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts  # NextAuth 端点
│   │   ├── auth/
│   │   │   └── secondme/
│   │   │       ├── token/route.ts      # 自定义 token 交换
│   │   │       └── userinfo/route.ts   # 自定义 userinfo 代理
│   │   └── profile/route.ts            # 获取 SecondMe 个人信息
│   ├── components/
│   │   └── Providers.tsx               # SessionProvider 包裹组件
│   ├── layout.tsx
│   └── page.tsx                        # 主页（登录/个人信息展示）
├── lib/
│   ├── prisma.ts                       # Prisma 单例
│   └── secondme.ts                     # SecondMe API 客户端
├── types/
│   └── env.d.ts                        # 环境变量类型声明
└── ...
```

## 核心功能说明

### OAuth 登录流程

1. 用户点击「使用 SecondMe 登录」
2. 跳转到 SecondMe 授权页面
3. 授权后携带 `code` 返回应用
4. NextAuth 通过本地 `/api/auth/secondme/token` 交换 `access_token`
5. 通过本地 `/api/auth/secondme/userinfo` 获取用户信息
6. 自动创建/更新本地用户记录，建立会话

### 个人信息接口

- **GET** `/api/profile`：返回当前登录用户的 SecondMe 详细信息（头像、昵称、邮箱、SecondMe ID 等）

此接口使用服务端存储的 `accessToken` 调用 SecondMe API，并解包统一响应格式。

## 设计与原则

- 亮色主题，简约优雅的用户界面
- 全站中文界面
- 无复杂动画，仅使用简单过渡效果
- 稳定优先，最小依赖

## 后续扩展方向

- 集成 ToWow Agent 身份关联
- 基于 SecondMe 数据的信任评分系统
- 可验证凭证（VC）的签发与验证
- 笔记、聊天等功能模块（根据需求）

## 注意事项

- `.secondme/` 和 `.env.local` 包含敏感信息，勿提交到 Git
- NextAuth v5 仍处于 Beta，部分 API 可能有变动
- 生产环境必须配置 HTTPS 和安全的 `NEXTAUTH_SECRET`
- 确保 PostgreSQL 数据库持续可用

## 参考文档

- SecondMe 开发文档: https://develop-docs.second.me
- NextAuth.js 官方指南: https://authjs.dev
- 本地开发文档详见 `E:/Obsidian/信契/轻量级 MVP 计划书.md`