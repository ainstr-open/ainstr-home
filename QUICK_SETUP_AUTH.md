# 🚀 登录服务快速配置指南

本指南将帮助您在 10 分钟内配置好登录服务。

## 📋 前置要求

1. Cloudflare 账号
2. Google 账号（用于创建 Google OAuth 应用）
3. GitHub 账号（用于创建 GitHub OAuth 应用）

## 🔧 步骤 1: 运行配置脚本

```bash
# 给脚本添加执行权限
chmod +x scripts/setup-auth.sh

# 运行配置脚本
./scripts/setup-auth.sh
```

脚本会自动：
- ✅ 检查并创建 `.env.local` 文件
- ✅ 检查并创建 `.dev.vars` 文件
- ✅ 检查数据库配置
- ✅ 显示配置状态

## 🔑 步骤 2: 创建 Google OAuth 应用

### 2.1 访问 Google Cloud Console

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 项目名称：`Ainstr OAuth`（或您喜欢的名称）

### 2.2 创建 OAuth 客户端 ID

> **注意**: Google OAuth 2.0 不需要特别启用某个 API，直接创建 OAuth 客户端 ID 即可。

1. 左侧菜单选择 **API 和服务** → **凭据**
2. 点击 **创建凭据** → **OAuth 客户端 ID**
3. 如果是首次创建，需要先配置 **OAuth 同意屏幕**：
   - 用户类型：**外部**
   - 应用名称：`Ainstr`
   - 用户支持电子邮件：您的邮箱
   - 开发者联系信息：您的邮箱
   - 保存并继续
4. 创建 OAuth 客户端 ID：
   - 应用类型：**Web 应用程序**
   - 名称：`Ainstr Web Client`
   - 已获授权的 JavaScript 来源：
     ```
     http://localhost:3000
     https://ainstr.com
     ```
   - 已获授权的重定向 URI：
     ```
     http://localhost:3000/auth/callback
     https://ainstr.com/auth/callback
     ```
5. 点击 **创建**
6. **复制 Client ID 和 Client Secret**（Secret 只显示一次，请保存好）

### 2.4 配置环境变量

将获得的 Client ID 和 Secret 填入：

**`.env.local`**（前端）：
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的Google_Client_ID
```

**`.dev.vars`**（后端）：
```env
GOOGLE_CLIENT_ID=你的Google_Client_ID
GOOGLE_CLIENT_SECRET=你的Google_Client_Secret
```

## 🐙 步骤 3: 创建 GitHub OAuth 应用

### 3.1 访问 GitHub 设置

1. 访问 [GitHub Settings](https://github.com/settings/developers)
2. 点击 **New OAuth App**

### 3.2 填写应用信息

- **Application name**: `Ainstr`
- **Homepage URL**: `https://ainstr.com`
- **Authorization callback URL**: `https://ainstr.com/auth/callback`
  - 本地开发时也需要添加：`http://localhost:3000/auth/callback`

### 3.3 保存并获取密钥

1. 点击 **Register application**
2. **复制 Client ID**
3. 点击 **Generate a new client secret**
4. **复制 Client Secret**（只显示一次，请保存好）

### 3.4 配置环境变量

**`.env.local`**（前端）：
```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=你的GitHub_Client_ID
```

**`.dev.vars`**（后端）：
```env
GITHUB_CLIENT_ID=你的GitHub_Client_ID
GITHUB_CLIENT_SECRET=你的GitHub_Client_Secret
```

## 💾 步骤 4: 配置 Cloudflare D1 数据库

### 4.1 安装 Wrangler CLI（如果还没有）

```bash
npm install -g wrangler
# 或
npm install --save-dev wrangler
```

### 4.2 登录 Cloudflare

```bash
wrangler login
```

浏览器会自动打开，登录您的 Cloudflare 账号。

### 4.3 创建 D1 数据库

```bash
wrangler d1 create ainstr-db
```

输出示例：
```
✅ Successfully created DB 'ainstr-db' in region APAC

[[d1_databases]]
binding = "DB"
database_name = "ainstr-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4.4 更新 wrangler.jsonc

将 `database_id` 复制到 `wrangler.jsonc`：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ainstr-db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // 替换为实际的 ID
    }
  ]
}
```

### 4.5 初始化数据库

```bash
# 初始化生产数据库
wrangler d1 execute ainstr-db --file=./db/schema.sql

# 初始化本地开发数据库
wrangler d1 execute ainstr-db --local --file=./db/schema.sql
```

## 🧪 步骤 5: 测试配置

### 5.1 启动开发服务器

```bash
# 启动 Next.js 开发服务器
npm run dev

# 在另一个终端启动 Cloudflare Pages Functions（本地）
wrangler pages dev out --local --d1=DB=ainstr-db
```

### 5.2 测试登录功能

1. 访问 http://localhost:3000
2. 点击右上角 **登录/注册**
3. 选择 **Google** 或 **GitHub** 登录
4. 完成 OAuth 授权
5. 验证是否成功登录

## 📝 配置检查清单

运行配置脚本检查所有配置：

```bash
./scripts/setup-auth.sh
```

确保以下项目都已配置：

- [ ] `.env.local` 文件存在
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 已填入
- [ ] `NEXT_PUBLIC_GITHUB_CLIENT_ID` 已填入
- [ ] `.dev.vars` 文件存在
- [ ] `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 已填入
- [ ] `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 已填入
- [ ] `wrangler.jsonc` 中的 `database_id` 已配置
- [ ] D1 数据库已初始化

## 🚀 部署到生产环境

### 在 Cloudflare Dashboard 中配置环境变量

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择您的 Pages 项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

```
GOOGLE_CLIENT_ID=你的Google_Client_ID
GOOGLE_CLIENT_SECRET=你的Google_Client_Secret
GITHUB_CLIENT_ID=你的GitHub_Client_ID
GITHUB_CLIENT_SECRET=你的GitHub_Client_Secret
APP_URL=https://ainstr.com
```

### 确保 OAuth 回调 URL 正确

在生产环境的 OAuth 应用中，确保回调 URL 包含：
- `https://ainstr.com/auth/callback`

## 🐛 常见问题

### 问题 1: OAuth 回调失败

**原因**: 回调 URL 配置不正确

**解决**:
- 检查 Google/GitHub OAuth 应用的回调 URL 设置
- 确保与 `APP_URL` 环境变量一致

### 问题 2: 数据库连接失败

**原因**: `database_id` 未配置或配置错误

**解决**:
```bash
# 检查数据库列表
wrangler d1 list

# 确认 database_id 正确
cat wrangler.jsonc
```

### 问题 3: 环境变量未生效

**解决**:
- 前端：检查 `.env.local`，重启开发服务器
- 后端：检查 `.dev.vars`（本地）或 Cloudflare Dashboard（生产）

### 问题 4: CORS 错误

**原因**: API 域名与前端域名不匹配

**解决**:
- 检查 `NEXT_PUBLIC_API_URL` 是否正确
- 确保本地开发时使用 `http://localhost:8788`（Cloudflare Pages Functions 端口）

## 📚 相关文档

- [AUTH_SETUP.md](./AUTH_SETUP.md) - 详细的 OAuth 配置说明
- [CLOUDFLARE_D1_SETUP.md](./CLOUDFLARE_D1_SETUP.md) - 数据库配置详细说明
- [CONFIG_CHECK.md](./CONFIG_CHECK.md) - 配置检查清单

## ✅ 完成

配置完成后，您应该能够：
- ✅ 使用 Google 登录
- ✅ 使用 GitHub 登录
- ✅ 用户信息保存到数据库
- ✅ 支持多登录方式关联同一账户

如有问题，请查看相关文档或检查日志。

