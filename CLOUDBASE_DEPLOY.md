# CloudBase 部署指南

## 前置条件

1. 腾讯云账号（已实名认证）
2. 已开通云开发 CloudBase（免费额度）
3. 本地已安装 Node.js 和 npm
4. 已安装 CloudBase CLI

## 步骤 1：安装 CloudBase CLI

```bash
npm install -g @cloudbase/cli
```

## 步骤 2：登录 CloudBase

```bash
cloudbase login
```

会打开浏览器进行扫码授权。

## 步骤 3：创建 CloudBase 环境

1. 访问 CloudBase 控制台：https://console.cloud.tencent.com/tcb
2. 点击"创建环境"
3. 环境名称：`xenos-prod`（或自定义）
4. 环境 ID 会自动生成，记下来
5. 选择"按量计费"（免费额度足够）
6. 等待环境初始化完成（约 2-3 分钟）

## 步骤 4：配置数据库（可选）

### 方案 A：使用 CloudBase 自带数据库
- 在控制台"数据库"中创建集合
- 获取连接字符串（类似于 PostgreSQL）

### 方案 B：继续使用 Supabase（推荐测试阶段）
- 保持现有的 `DATABASE_URL` 不变
- 在 CloudBase 环境变量中配置

## 步骤 5：设置环境变量

在 CloudBase 控制台：
1. 进入你的环境
2. 左侧"云函数" → "环境变量"
3. 添加以下变量（Production 环境）：

| 变量名 | 值 |
|--------|-----|
| `SECONDME_CLIENT_ID` | `79127965-7c40-4609-9862-15933fa9712e` |
| `SECONDME_CLIENT_SECRET` | `9e4dc0a90f0292be2ce79e5861dae535a323ae78ec6cdb8c7a4a18c628493870` |
| `SECONDME_REDIRECT_URI` | `https://你的环境ID.service.tcloudbase.com/api/auth/callback` |
| `SECONDME_OAUTH_URL` | `https://go.second.me/oauth/` |
| `SECONDME_API_BASE_URL` | `https://app.mindos.com/gate/lab` |
| `NEXTAUTH_URL` | `https://你的环境ID.service.tcloudbase.com` |
| `NEXTAUTH_SECRET` | 生成随机字符串: `openssl rand -base64 32` |
| `DATABASE_URL` | 你的数据库连接串（如果有） |

⚠️ 将 `你的环境ID` 替换为实际的环境 ID（如 `xenos-8d6c`）

## 步骤 6：本地构建

```bash
npm install
npm run build
```

这会在 `.next` 目录生成生产构建。

## 步骤 7：部署到 CloudBase

```bash
cloudbase deploy --env 你的环境ID
```

首次部署会询问是否创建云函数和静态托管，全部选"是"。

## 步骤 8：验证

1. 访问：`https://你的环境ID.service.tcloudbase.com`
2. 应该看到首页
3. 测试登录流程

## 常见问题

### Q1: 部署失败，提示"函数创建失败"
- 检查 Node.js 版本：CloudBase 默认 Node.js 18，确保 `package.json` 中 `engines.node` 设置

### Q2: 静态资源 404
- 确保 `next.config.js` 中配置了正确的输出
- 检查 `cloudbaserc.json` 中的静态目录配置

### Q3: 数据库连接失败
- 如果使用 Supabase，确保 IP 白名单包含 CloudBase 的出口 IP
- 或者将数据库迁移到 CloudBase 自带的 PostgreSQL

---

## 下一步

部署成功后，如果需要绑定自定义域名：
1. CloudBase 控制台 →"域名管理"
2. 添加域名并配置 CNAME
3. 在域名解析商处配置解析

--- 

有问题随时问我！🕵️