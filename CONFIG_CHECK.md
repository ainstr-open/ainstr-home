# 登录服务配置检查清单

## ✅ 已完成的配置

1. ✅ **前端代码**：已实现登录模态框和 AuthContext
2. ✅ **后端代码**：已创建 Cloudflare Workers 函数
3. ✅ **数据库 Schema**：已定义 `db/schema.sql`
4. ✅ **类型定义**：已定义 TypeScript 类型

## ⚠️ 需要配置的内容

### 1. OAuth 应用配置

#### Google OAuth
- [ ] 访问 [Google Cloud Console](https://console.cloud.google.com/)
- [ ] 创建项目或选择现有项目
- [ ] 启用 Google+ API
- [ ] 创建 OAuth 2.0 客户端 ID
- [ ] 配置授权重定向 URI：
  - 生产环境：`https://ainstr.com/auth/callback`
  - 开发环境：`http://localhost:3000/auth/callback`
- [ ] 保存 **Client ID** 和 **Client Secret**

#### GitHub OAuth
- [ ] 访问 GitHub Settings → Developer settings → OAuth Apps
- [ ] 创建新的 OAuth App
- [ ] 配置回调 URL：`https://ainstr.com/auth/callback`
- [ ] 保存 **Client ID**
- [ ] 生成 **Client Secret**

### 2. Cloudflare D1 数据库配置

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 创建数据库
wrangler d1 create ainstr-db

# 3. 复制输出的 database_id 到 wrangler.jsonc
# 编辑 wrangler.jsonc，填入 database_id

# 4. 初始化数据库
wrangler d1 execute ainstr-db --file=./db/schema.sql

# 5. 本地开发（可选）
wrangler d1 execute ainstr-db --local --file=./db/schema.sql
```

### 3. 环境变量配置

#### 前端环境变量（`.env.local`）

创建 `.env.local` 文件（不要提交到 Git）：

```env
# OAuth Client IDs（前端使用）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here

# API URL（前端调用后端 API 的地址）
NEXT_PUBLIC_API_URL=https://ainstr.com
# 本地开发时使用：
# NEXT_PUBLIC_API_URL=http://localhost:8788
```

#### Cloudflare Workers 环境变量（`.dev.vars` 用于本地开发）

创建 `.dev.vars` 文件（不要提交到 Git）：

```env
# OAuth Client IDs 和 Secrets（后端使用）
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# 应用 URL
APP_URL=http://localhost:8788
# 生产环境在 Cloudflare Dashboard 中配置
```

#### Cloudflare Pages 生产环境变量

在 Cloudflare Dashboard → Pages → 你的项目 → Settings → Environment Variables 中添加：

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `APP_URL` (设置为 `https://ainstr.com`)

### 4. 更新 wrangler.jsonc

确保 `database_id` 已填入：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ainstr-db",
      "database_id": "你的数据库ID"  // ⚠️ 需要填入
    }
  ]
}
```

## 🧪 测试配置

### 1. 检查环境变量

```bash
# 检查前端环境变量（开发时）
echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID
echo $NEXT_PUBLIC_GITHUB_CLIENT_ID
echo $NEXT_PUBLIC_API_URL
```

### 2. 测试本地开发

```bash
# 启动 Next.js 开发服务器
npm run dev

# 在另一个终端启动 Cloudflare Pages Functions（本地）
wrangler pages dev out --local --d1=DB=ainstr-db

# 访问 http://localhost:3000 测试登录功能
```

### 3. 检查 API 端点

确保以下 API 端点可以访问：

- `POST /api/auth/google/callback`
- `POST /api/auth/github/callback`
- `GET /api/user/me` (需要认证)

## 🔍 故障排除

### 问题 1: OAuth 回调失败

**原因**：回调 URL 配置不正确

**解决**：
- 检查 Google/GitHub OAuth 应用的回调 URL 设置
- 确保与 `APP_URL` 环境变量一致

### 问题 2: 数据库连接失败

**原因**：`database_id` 未配置或配置错误

**解决**：
- 检查 `wrangler.jsonc` 中的 `database_id`
- 确保数据库已创建：`wrangler d1 list`

### 问题 3: 环境变量未生效

**原因**：环境变量未正确设置

**解决**：
- 前端：检查 `.env.local` 文件，重启开发服务器
- 后端：检查 `.dev.vars` 文件（本地）或 Cloudflare Dashboard（生产环境）

### 问题 4: CORS 错误

**原因**：API 域名与前端域名不匹配

**解决**：
- 检查 `NEXT_PUBLIC_API_URL` 是否正确
- 确保 `functions/_middleware.ts` 中的 CORS 配置正确

## 📝 配置完成后

配置完成后，登录流程应该是：

1. 用户点击"登录/注册"按钮
2. 选择 Google 或 GitHub 登录
3. 跳转到 OAuth 提供商的授权页面
4. 授权后跳转回 `/auth/callback`
5. 前端调用后端 API `/api/auth/{provider}/callback`
6. 后端验证 code，获取用户信息，保存到数据库
7. 返回用户信息和 session token
8. 前端保存用户信息和 token
9. 显示用户头像和菜单

## 🚀 下一步

配置完成后，可以：
1. 测试完整的登录流程
2. 测试用户信息持久化
3. 测试多登录方式关联
4. 部署到生产环境

