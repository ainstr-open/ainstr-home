# Cloudflare D1 数据库配置指南

本文档说明如何配置 Cloudflare D1 数据库来保存用户信息。

## 📋 前置要求

1. Cloudflare 账号
2. Wrangler CLI 已安装
3. 已配置 OAuth 应用（Google 和 GitHub）

## 🚀 快速开始

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或
npm install --save-dev wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

```bash
wrangler d1 create ainstr-db
```

这会输出数据库 ID，例如：
```
✅ Successfully created DB 'ainstr-db' in region APAC
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via snapshots to R2.

[[d1_databases]]
binding = "DB"
database_name = "ainstr-db"
database_id = "your-database-id-here"
```

### 4. 更新 wrangler.jsonc

将 `database_id` 复制到 `wrangler.jsonc`：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ainstr-db",
      "database_id": "your-database-id-here"  // 替换为实际的数据库 ID
    }
  ]
}
```

### 5. 初始化数据库 Schema

```bash
wrangler d1 execute ainstr-db --file=./db/schema.sql
```

或使用本地数据库进行开发：

```bash
wrangler d1 execute ainstr-db --local --file=./db/schema.sql
```

### 6. 配置环境变量

在 Cloudflare Pages 项目设置中，添加以下环境变量：

**生产环境：**
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret
- `APP_URL` - 应用 URL (例如: https://ainstr.com)

**开发环境（本地测试）：**

创建 `.dev.vars` 文件（不要提交到 Git）：

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
APP_URL=http://localhost:8788
```

### 7. 部署到 Cloudflare Pages

#### 方式 1: 使用 Git 集成（推荐）

1. 在 Cloudflare Dashboard 中配置 Git 集成
2. 确保构建配置正确：
   - **Build command**: `npm run build`
   - **Output directory**: `out`
   - **Root directory**: `/`

#### 方式 2: 使用 Wrangler

```bash
wrangler pages deploy out --project-name=ainstr-mcp-square
```

## 📁 项目结构

```
├── functions/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [provider]/
│   │   │       └── callback.ts    # OAuth 回调处理
│   │   └── user/
│   │       └── me.ts              # 获取当前用户信息
│   ├── types.ts                   # TypeScript 类型定义
│   └── _middleware.ts             # CORS 中间件
├── db/
│   └── schema.sql                 # 数据库 Schema
└── wrangler.jsonc                 # Wrangler 配置
```

## 🔧 本地开发

### 启动本地开发服务器

```bash
wrangler pages dev out --local --d1=DB=ainstr-db
```

这会在 `http://localhost:8788` 启动开发服务器。

### 本地数据库操作

```bash
# 执行 SQL
wrangler d1 execute ainstr-db --local --command="SELECT * FROM users"

# 查看数据库信息
wrangler d1 info ainstr-db --local
```

## 📊 数据库 Schema

### accounts 表（账户主表）

存储账户基本信息。邮箱作为唯一标识，但可以为空（允许后续绑定）。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 账户唯一标识 |
| email | TEXT (UNIQUE, NULLABLE) | 用户邮箱（唯一标识，可以为空） |
| name | TEXT | 默认名称 |
| image_url | TEXT | 默认头像 URL |
| created_at | INTEGER | 创建时间（Unix 时间戳） |
| updated_at | INTEGER | 更新时间 |
| last_login_at | INTEGER | 最后登录时间 |

### account_providers 表（账户登录方式表）

存储账户关联的登录方式。一个账户可以关联多个登录方式（GitHub、Google等）。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 记录唯一标识 |
| account_id | TEXT (FK) | 账户 ID |
| provider | TEXT | 登录方式 ('google', 'github' 等) |
| provider_id | TEXT | OAuth 提供商的用户 ID |
| provider_email | TEXT (NULLABLE) | 该登录方式对应的邮箱（可能为空） |
| provider_name | TEXT | 该登录方式对应的名称 |
| provider_image_url | TEXT | 该登录方式对应的头像 |
| created_at | INTEGER | 创建时间 |
| last_used_at | INTEGER | 最后使用时间 |

**唯一约束**: `(provider, provider_id)` - 每个 provider 的 provider_id 必须唯一

### account_sessions 表（账户会话表）

存储账户会话信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 会话唯一标识 |
| account_id | TEXT (FK) | 账户 ID |
| token | TEXT (UNIQUE) | 会话令牌 |
| expires_at | INTEGER | 过期时间（Unix 时间戳） |
| created_at | INTEGER | 创建时间 |

## 🔑 账户关联逻辑

1. **邮箱优先匹配**：如果 OAuth 返回的邮箱已存在于账户表或 provider 表中，则关联到现有账户
2. **Provider 唯一性**：每个 provider 的 provider_id 必须唯一，如果已存在则更新该 provider 信息
3. **多 Provider 支持**：一个账户可以关联多个登录方式（GitHub、Google等）
4. **邮箱可空**：账户邮箱可以为空，用户后续可以自主绑定邮箱
5. **自动合并**：如果使用不同登录方式但邮箱相同，会自动关联到同一个账户

## 🔍 API 端点

### POST /api/auth/[provider]/callback

处理 OAuth 回调。

**请求体：**
```json
{
  "code": "oauth_code",
  "state": "state_string"
}
```

**响应：**
```json
{
  "user": {
    "id": "user_id",
    "provider": "google",
    "email": "user@example.com",
    "name": "User Name",
    "imageUrl": "https://..."
  },
  "token": "session_token",
  "sessionId": "session_id"
}
```

### GET /api/user/me

获取当前账户信息（需要认证）。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "id": "account_id",
  "email": "user@example.com",
  "name": "User Name",
  "image": "https://...",
  "provider": "google"
}
```

### POST /api/user/email/bind

绑定邮箱到账户（需要认证）。

**请求头：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "email": "user@example.com"
}
```

**响应：**
```json
{
  "success": true,
  "email": "user@example.com"
}
```

### GET /api/user/providers

获取账户关联的所有登录方式（需要认证）。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "providers": [
    {
      "provider": "google",
      "provider_email": "user@example.com",
      "provider_name": "User Name",
      "provider_image_url": "https://...",
      "created_at": 1234567890,
      "last_used_at": 1234567890
    },
    {
      "provider": "github",
      "provider_email": null,
      "provider_name": "username",
      "provider_image_url": "https://...",
      "created_at": 1234567890,
      "last_used_at": 1234567890
    }
  ]
}
```

### DELETE /api/user/providers?provider=google&provider_id=xxx

删除账户关联的某个登录方式（需要认证，至少保留一个登录方式）。

**请求头：**
```
Authorization: Bearer <token>
```

**查询参数：**
- `provider`: 登录方式（如 'google', 'github'）
- `provider_id`: Provider 的用户 ID

**响应：**
```json
{
  "success": true
}
```

## 🔒 安全注意事项

1. **环境变量**：永远不要将 `client_secret` 提交到代码仓库
2. **Token 安全**：会话 token 存储在客户端，应考虑使用 HttpOnly cookies（需要额外配置）
3. **CORS**：生产环境应限制 CORS 来源
4. **Rate Limiting**：考虑添加速率限制防止滥用
5. **State 验证**：OAuth state 参数应使用 KV 或更安全的存储方式验证

## 🐛 故障排除

### 数据库连接失败

确保 `wrangler.jsonc` 中的 `database_id` 正确。

### 环境变量未生效

- 检查 Cloudflare Pages 设置中的环境变量配置
- 本地开发时确保 `.dev.vars` 文件存在且格式正确

### CORS 错误

确保 `functions/_middleware.ts` 正确配置了 CORS 头。

### OAuth 回调失败

- 检查 OAuth 应用的回调 URL 配置
- 确认环境变量中的 Client ID 和 Secret 正确
- 查看 Cloudflare Workers 日志

## 📚 参考资源

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

