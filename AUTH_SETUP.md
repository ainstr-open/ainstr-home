# OAuth 登录配置指南

本文档说明如何配置 Google 和 GitHub OAuth 登录功能。

## 📋 前置要求

1. Google Cloud Console 账号（用于 Google 登录）
2. GitHub 账号（用于 GitHub 登录）

## 🔧 配置步骤

### 1. Google OAuth 配置

#### 1.1 创建 Google OAuth 客户端

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 进入 **API 和服务** → **凭据** → **创建凭据** → **OAuth 客户端 ID**

> **注意**: Google OAuth 2.0 不需要特别启用某个 API，直接创建 OAuth 客户端 ID 即可。如果系统提示需要启用 API，可以按照提示操作，但通常不是必需的。

4. 如果是首次创建，需要先配置 **OAuth 同意屏幕**：
   - 用户类型：**外部**
   - 应用名称：`Ainstr`
   - 用户支持电子邮件：您的邮箱
   - 开发者联系信息：您的邮箱
   - 保存并继续

5. 创建 OAuth 客户端 ID：
   - 应用类型选择 **Web 应用程序**
   - 名称：`Ainstr Web Client`
   - 已获授权的 JavaScript 来源：
     ```
     http://localhost:3000
     https://ainstr.com
     ```
   - 授权重定向 URI 添加：
   ```
   https://ainstr.com/auth/callback
   http://localhost:3000/auth/callback (开发环境)
     ```
6. 点击 **创建**
7. 保存后获得 **客户端 ID** 和 **客户端密钥**（Secret 只显示一次，请保存好）

#### 1.2 配置环境变量

在 `.env.local` 文件中添加：

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

⚠️ **注意**：由于是静态站点，客户端密钥需要后端 API 处理，不要放在前端代码中。

### 2. GitHub OAuth 配置

#### 2.1 创建 GitHub OAuth App

1. 访问 GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. 点击 **New OAuth App**
3. 填写信息：
   - **Application name**: Ainstr
   - **Homepage URL**: `https://ainstr.com`
   - **Authorization callback URL**: `https://ainstr.com/auth/callback`
4. 点击 **Register application**
5. 保存 **Client ID**
6. 生成 **Client Secret**

#### 2.2 配置环境变量

在 `.env.local` 文件中添加：

```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
```

⚠️ **注意**：由于是静态站点，客户端密钥需要后端 API 处理，不要放在前端代码中。

### 3. 后端 API 配置

⚠️ **重要**：由于 Next.js 静态导出模式，OAuth 回调需要在后端处理。

#### 需要实现的后端 API

1. **POST `/api/auth/google/callback`**
   - 接收 `code` 和 `state`
   - 使用 `client_secret` 交换 access_token
   - 获取用户信息
   - 返回用户数据

2. **POST `/api/auth/github/callback`**
   - 接收 `code` 和 `state`
   - 使用 `client_secret` 交换 access_token
   - 获取用户信息
   - 返回用户数据

#### 后端实现示例（Node.js/Express）

```javascript
// Google OAuth 回调处理
app.post('/api/auth/google/callback', async (req, res) => {
  const { code, state } = req.body

  // 验证 state
  // ...

  // 交换 token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  })

  const tokens = await tokenResponse.json()

  // 获取用户信息
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  })

  const userInfo = await userResponse.json()

  // 返回用户数据
  res.json({
    id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    image: userInfo.picture,
    provider: 'google'
  })
})

// GitHub OAuth 回调处理
app.post('/api/auth/github/callback', async (req, res) => {
  const { code, state } = req.body

  // 验证 state
  // ...

  // 交换 token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    })
  })

  const tokens = await tokenResponse.json()

  // 获取用户信息
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  })

  const userInfo = await userResponse.json()

  // 获取用户邮箱
  const emailResponse = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  })
  const emails = await emailResponse.json()
  const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email

  // 返回用户数据
  res.json({
    id: userInfo.id.toString(),
    name: userInfo.name || userInfo.login,
    email: primaryEmail,
    image: userInfo.avatar_url,
    provider: 'github'
  })
})
```

## 🔄 更新 AuthContext

在 `src/contexts/AuthContext.tsx` 中更新 `handleOAuthCallbackCode` 函数：

```typescript
const handleOAuthCallbackCode = async (
  provider: 'google' | 'github',
  code: string,
  state: string
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/${provider}/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state })
    })

    if (!response.ok) {
      throw new Error('Failed to authenticate')
    }

    const userData = await response.json()
    setUserData(userData)
  } catch (error) {
    console.error('OAuth callback error:', error)
    throw error
  }
}
```

## 🚀 部署注意事项

### Cloudflare Pages

如果使用 Cloudflare Pages，需要：

1. 在 Cloudflare Pages 设置中添加环境变量
2. 配置后端 API（可以使用 Cloudflare Workers）
3. 或者在服务器上部署后端 API

### 环境变量

在生产环境中，确保：

- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 已设置
- ✅ `NEXT_PUBLIC_GITHUB_CLIENT_ID` 已设置
- ✅ 后端 API 可以访问 `client_secret`
- ✅ OAuth 回调 URL 正确配置

## 📝 当前状态

⚠️ **注意**：当前实现仅包含前端部分。要完整启用 OAuth 登录，需要：

1. 配置后端 API 服务
2. 实现 `/api/auth/{provider}/callback` 端点
3. 更新 `AuthContext` 中的 API 调用
4. 配置环境变量

## 🔒 安全注意事项

1. **永远不要**将 `client_secret` 放在前端代码中
2. 使用 `state` 参数防止 CSRF 攻击
3. 验证 `state` 参数的有效性
4. 使用 HTTPS 部署
5. 安全存储用户 session/token

## 📚 参考资源

- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth 文档](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [OAuth 2.0 安全最佳实践](https://oauth.net/2/)

