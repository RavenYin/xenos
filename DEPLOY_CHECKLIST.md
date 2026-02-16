# 部署检查清单

## ✅ 步骤 1：创建数据库（Supabase）

- [ ] 访问 https://supabase.com
- [ ] 注册/登录账号
- [ ] 创建新项目：
  - Project name: `xenos-db`
  - Database password: [设置强密码]
  - Region: `Asia (Singapore)`
- [ ] 等待项目创建完成
- [ ] 进入 Settings → Database
- [ ] 复制 **Connection string** (URI 格式)
- [ ] 替换占位符密码，保存到安全位置

## ✅ 步骤 2：部署到 Vercel

### 方式 A：Vercel 网站部署（推荐）

- [ ] 访问 https://vercel.com/new
- [ ] 导入 GitHub 仓库或拖拽上传代码
- [ ] 配置 Build & Output Settings：
  - Framework Preset: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
- [ ] 添加环境变量：
  ```
  NEXTAUTH_URL=https://[your-project].vercel.app
  NEXTAUTH_SECRET=pgPXwDDO0SONLT8ZjSaiquNiNvpQQZ1SN44cpDDlY4Y=
  SECONDME_CLIENT_ID=79127965-7c40-4609-9862-15933fa9712e
  SECONDME_CLIENT_SECRET=9e4dc0a90f0292be2ce79e5861dae535a323ae78ec6cdb8c7a4a18c628493870
  SECONDME_ENDPOINT=https://app.mindos.com/gate/lab
  DATABASE_URL=[从 Supabase 复制的连接串]
  ```
- [ ] 点击 Deploy
- [ ] 等待部署完成，记录域名（如 `xenos.vercel.app`）

### 方式 B：CLI 部署

```bash
# 1. 登录 Vercel
npx vercel login

# 2. 进入项目目录
cd E:\VScode\Xenos

# 3. 部署
npx vercel --prod

# 4. 设置环境变量（在 Vercel 网站完成）
```

## ✅ 步骤 3：更新 SecondMe 回调地址

- [ ] 访问 https://develop.second.me/apps/79127965-7c40-4609-9862-15933fa9712e/info
- [ ] 找到 **Redirect URIs** 字段
- [ ] 添加新的回调地址：
  ```
  https://[your-project].vercel.app/api/auth/callback/secondme
  ```
- [ ] 确保保留本地开发地址（可选）：
  ```
  http://localhost:3001/api/auth/callback/secondme
  ```
- [ ] 点击 **Save** 保存

## ✅ 步骤 4：数据库迁移

- [ ] 在本地运行：
  ```bash
  npx prisma db push
  ```
- [ ] 或在 Vercel 部署后访问：
  ```
  https://[your-project].vercel.app/api/debug-callback
  ```
  检查数据库连接

## ✅ 步骤 5：验证部署

- [ ] 访问生产环境域名
- [ ] 点击"使用 SecondMe 登录"
- [ ] 完成授权流程
- [ ] 确认跳转到 Dashboard
- [ ] 检查用户信息是否正确显示

## 🔧 故障排除

### 问题 1：OAuth 回调失败
**症状**：授权后返回 `?error=OAuthCallback`
**解决**：
1. 检查 Redirect URI 是否完全匹配（包括 https）
2. 检查环境变量是否正确设置
3. 查看 Vercel Functions 日志

### 问题 2：数据库连接失败
**症状**：页面显示 500 错误或登录后无响应
**解决**：
1. 检查 DATABASE_URL 格式正确
2. 确认 Supabase 项目已启动
3. 检查 Supabase IP 白名单设置

### 问题 3：环境变量未生效
**症状**：部署后应用行为异常
**解决**：
1. 在 Vercel 控制台重新部署
2. 检查变量名拼写
3. 确保 Production 环境变量已设置

## 📚 相关链接

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- SecondMe Developer: https://develop.second.me
- 应用管理: https://develop.second.me/apps/79127965-7c40-4609-9862-15933fa9712e/info

## 🎉 部署成功后

你将获得：
- 生产环境域名（如 `xenos.vercel.app`）
- 稳定的 SecondMe OAuth 登录
- 可分享给他人的链接
- 自动 HTTPS 加密

---

**开始部署了吗？遇到问题随时告诉我！** 🚀
