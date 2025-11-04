# 环境变量配置位置说明

## 🔐 重要安全提示

**`GOOGLE_CLIENT_SECRET` 和 `GITHUB_CLIENT_SECRET` 是敏感信息，绝对不能放在前端代码中！**

- ❌ **不要**放在 `.env.local`（前端）
- ✅ **必须**放在后端环境变量中

## 📍 配置位置

### 1. 本地开发环境

**文件位置**: `.dev.vars`（项目根目录）

编辑 `.dev.vars` 文件，添加：

```env
# Google OAuth 配置（后端使用）
GOOGLE_CLIENT_ID=你的Google_Client_ID
GOOGLE_CLIENT_SECRET=你的Google_Client_Secret

# GitHub OAuth 配置（后端使用）
GITHUB_CLIENT_ID=你的GitHub_Client_ID
GITHUB_CLIENT_SECRET=你的GitHub_Client_Secret

# 应用 URL
APP_URL=http://localhost:8788
```

> ⚠️ **注意**: `.dev.vars` 文件已在 `.gitignore` 中，不会被提交到 Git。

### 2. 生产环境

**位置**: Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择您的 Pages 项目
3. 进入 **Settings** → **Environment Variables**
4. 在 **Production** 标签页下添加：

| Variable Name | Value |
|--------------|-------|
| `GOOGLE_CLIENT_ID` | 你的Google_Client_ID |
| `GOOGLE_CLIENT_SECRET` | 你的Google_Client_Secret |
| `GITHUB_CLIENT_ID` | 你的GitHub_Client_ID |
| `GITHUB_CLIENT_SECRET` | 你的GitHub_Client_Secret |
| `APP_URL` | `https://ainstr.com` |

## 📋 前端 vs 后端环境变量

### 前端环境变量（`.env.local`）

前端只需要 **Client ID**（公开的，可以暴露在浏览器中）：

```env
# 前端只需要 Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的Google_Client_ID
NEXT_PUBLIC_GITHUB_CLIENT_ID=你的GitHub_Client_ID
NEXT_PUBLIC_API_URL=https://ainstr.com
```

### 后端环境变量（`.dev.vars` 或 Cloudflare Dashboard）

后端需要 **Client ID 和 Client Secret**（Secret 必须保密）：

```env
# 后端需要 Client ID 和 Secret
GOOGLE_CLIENT_ID=你的Google_Client_ID
GOOGLE_CLIENT_SECRET=你的Google_Client_Secret
GITHUB_CLIENT_ID=你的GitHub_Client_ID
GITHUB_CLIENT_SECRET=你的GitHub_Client_Secret
APP_URL=https://ainstr.com
```

## 🔄 完整配置示例

### 步骤 1: 配置前端环境变量

编辑 `.env.local`（如果不存在，运行 `./scripts/setup-auth.sh` 会自动创建）：

```env
# 前端环境变量
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.abcdefghijklmnop
NEXT_PUBLIC_API_URL=https://ainstr.com
```

### 步骤 2: 配置后端环境变量

编辑 `.dev.vars`：

```env
# 后端环境变量（本地开发）
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

GITHUB_CLIENT_ID=Iv1.abcdefghijklmnop
GITHUB_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

APP_URL=http://localhost:8788
```

### 步骤 3: 配置生产环境

在 Cloudflare Dashboard 中添加相同的变量（但 `APP_URL` 改为 `https://ainstr.com`）。

## ✅ 验证配置

运行配置检查脚本：

```bash
./scripts/setup-auth.sh
```

确保：
- ✅ `.env.local` 中只有 `NEXT_PUBLIC_*` 变量（没有 Secret）
- ✅ `.dev.vars` 中有 `GOOGLE_CLIENT_SECRET` 和 `GITHUB_CLIENT_SECRET`
- ✅ Cloudflare Dashboard 中已配置生产环境变量

## 🔒 安全最佳实践

1. ✅ **永远不要**将 Secret 提交到 Git
2. ✅ **永远不要**将 Secret 放在前端代码中
3. ✅ **永远不要**在浏览器控制台或网络请求中暴露 Secret
4. ✅ 使用不同的 Client ID/Secret 用于开发和生产环境
5. ✅ 定期轮换 Secret（如果泄露）

## 📝 为什么 Secret 不能放在前端？

- 前端代码是公开的，任何人都可以查看
- 浏览器中运行的所有代码都可以被检查和调试
- 如果 Secret 在前端，攻击者可以窃取并使用它
- OAuth Secret 应该只在服务器端使用，用于安全地交换授权码获取访问令牌

## 🆘 如果 Secret 泄露了怎么办？

1. 立即在 Google/GitHub 中撤销并重新生成 Secret
2. 更新所有环境变量
3. 检查是否有异常活动
4. 考虑轮换相关的所有凭证

