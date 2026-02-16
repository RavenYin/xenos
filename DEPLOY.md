# 部署到 Vercel 指南

## 方法一：使用 Vercel CLI（推荐）

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```
按提示在浏览器中完成授权。

### 3. 部署
```bash
cd E:\VScode\Xenos
vercel --prod
```

## 方法二：使用 GitHub + Vercel（自动部署）

### 1. 创建 GitHub 仓库
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/xenos.git
git push -u origin main
```

### 2. 在 Vercel 网站导入项目
- 访问 https://vercel.com/new
- 导入 GitHub 仓库
- 配置环境变量（见下文）
- 点击 Deploy

## 环境变量配置

在 Vercel 控制台或部署时配置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXTAUTH_URL` | `https://你的域名.vercel.app` | 生产环境 URL |
| `NEXTAUTH_SECRET` | `随机生成的密钥` | 用于加密会话 |
| `SECONDME_CLIENT_ID` | `79127965-7c40-4609-9862-15933fa9712e` | SecondMe Client ID |
| `SECONDME_CLIENT_SECRET` | `你的密钥` | SecondMe Client Secret |
| `SECONDME_ENDPOINT` | `https://app.mindos.com/gate/lab` | SecondMe API 端点 |
| `DATABASE_URL` | `PostgreSQL 连接串` | 数据库 URL |

### 生成 NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## 更新 SecondMe 回调地址

部署成功后，需要在 SecondMe 开发者后台添加新的回调地址：

1. 访问 https://develop.second.me
2. 进入你的应用设置
3. 在 **Redirect URIs** 中添加：
   ```
   https://你的域名.vercel.app/api/auth/callback/secondme
   ```
4. 保存设置

## 验证部署

部署完成后，访问你的 Vercel 域名，测试 SecondMe 登录是否正常。

## 故障排除

### 问题：OAuth 回调失败
- 检查 Redirect URI 是否完全匹配（包括 https 和路径）
- 确认环境变量已正确设置
- 查看 Vercel 函数日志

### 问题：数据库连接失败
- 确保使用云数据库（如 Supabase、Neon）
- 检查 DATABASE_URL 格式正确
- 确认数据库允许 Vercel IP 访问

## 推荐配置

### 免费数据库选项
- **Supabase**: https://supabase.com（免费 PostgreSQL）
- **Neon**: https://neon.tech（Serverless PostgreSQL）
- **Vercel Postgres**: Vercel 内置（付费）

### 创建 Supabase 数据库
1. 注册 Supabase
2. 创建新项目
3. 在 Settings > Database 中找到连接字符串
4. 添加到 Vercel 环境变量
