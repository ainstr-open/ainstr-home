import { Env, UserData, D1Database } from '../../../types'

/**
 * 处理 OAuth 回调
 * 支持 Google 和 GitHub
 */
export async function onRequestPost(context: { request: Request; env: Env; params: { provider: string } }): Promise<Response> {
  const { request, env, params } = context
  const { provider } = params

  if (provider !== 'google' && provider !== 'github') {
    return new Response(JSON.stringify({ error: 'Invalid provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const { code, state } = body

    if (!code || !state) {
      return new Response(JSON.stringify({ error: 'Missing code or state' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 验证 state（防止 CSRF）
    // 这里应该从 KV 或缓存中验证 state
    // 简化处理，实际应该验证 state

    let userData: UserData | null = null

    if (provider === 'google') {
      userData = await handleGoogleCallback(code, env)
    } else if (provider === 'github') {
      userData = await handleGithubCallback(code, env)
    }

    if (!userData) {
      return new Response(JSON.stringify({ error: 'Failed to get user data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 保存或更新账户到数据库
    const accountId = await saveOrUpdateAccount(env.DB, userData)

    // 创建会话
    const sessionId = generateSessionId()
    const token = generateToken()
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 天

    await env.DB.prepare(
      'INSERT INTO account_sessions (id, account_id, token, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, accountId, token, expiresAt).run()

    // 获取账户完整信息
    const account = await getAccountById(env.DB, accountId)

    return new Response(JSON.stringify({
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        image: account.image_url,
        provider: userData.provider,
      },
      token,
      sessionId,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * 处理 Google OAuth 回调
 */
async function handleGoogleCallback(code: string, env: Env): Promise<UserData | null> {
  const clientId = env.GOOGLE_CLIENT_ID
  const clientSecret = env.GOOGLE_CLIENT_SECRET
  const redirectUri = env.GOOGLE_REDIRECT_URI || `${env.APP_URL}/auth/callback`

  // 交换 code 获取 access_token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text()
    console.error('Google token exchange failed:', error)
    return null
  }

  const tokens = await tokenResponse.json()
  const accessToken = tokens.access_token

  // 获取用户信息
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userResponse.ok) {
    return null
  }

  const userInfo = await userResponse.json()

  return {
    provider: 'google',
    providerId: userInfo.id,
    email: userInfo.email,
    name: userInfo.name || userInfo.email.split('@')[0],
    imageUrl: userInfo.picture || null,
  }
}

/**
 * 处理 GitHub OAuth 回调
 */
async function handleGithubCallback(code: string, env: Env): Promise<UserData | null> {
  const clientId = env.GITHUB_CLIENT_ID
  const clientSecret = env.GITHUB_CLIENT_SECRET
  const redirectUri = env.GITHUB_REDIRECT_URI || `${env.APP_URL}/auth/callback`

  // 交换 code 获取 access_token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text()
    console.error('GitHub token exchange failed:', error)
    return null
  }

  const tokens = await tokenResponse.json()
  const accessToken = tokens.access_token

  // 获取用户信息
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userResponse.ok) {
    return null
  }

  const userInfo = await userResponse.json()

  // 获取用户邮箱（GitHub 可能返回 null）
  let email: string | null = userInfo.email || null
  if (!email) {
    // 尝试从 GitHub API 获取邮箱列表
    try {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (emailResponse.ok) {
        const emails = await emailResponse.json()
        // 查找主要邮箱或验证邮箱
        const primaryEmail = emails.find((e: any) => e.primary && !e.email.includes('noreply'))?.email
          || emails.find((e: any) => !e.email.includes('noreply'))?.email
          || emails[0]?.email
        email = primaryEmail || null
      }
    } catch (error) {
      console.error('Failed to fetch GitHub emails:', error)
      // 如果获取邮箱失败，email 保持为 null
    }
  }

  // GitHub 邮箱可能为空，这是允许的
  return {
    provider: 'github',
    providerId: userInfo.id.toString(),
    email: email || null, // 允许为空，用户后续可以绑定邮箱
    name: userInfo.name || userInfo.login,
    imageUrl: userInfo.avatar_url || null,
  }
}

/**
 * 保存或更新账户到数据库
 * 逻辑：
 * 1. 先查找该 provider 是否已存在
 * 2. 如果存在，获取对应的 account_id
 * 3. 如果不存在：
 *    - 如果有邮箱，查找是否有相同邮箱的账户
 *    - 如果有相同邮箱，关联到该账户
 *    - 如果没有，创建新账户
 * 4. 更新或创建 account_providers 记录
 */
async function saveOrUpdateAccount(db: D1Database, userData: UserData): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  // 1. 查找该 provider 是否已存在
  const existingProvider = await db.prepare(
    'SELECT account_id, provider_email FROM account_providers WHERE provider = ? AND provider_id = ?'
  ).bind(userData.provider, userData.providerId).first<{ account_id: string; provider_email: string | null }>()

  let accountId: string

  if (existingProvider) {
    // Provider 已存在，使用现有账户
    accountId = existingProvider.account_id

    // 更新 provider 信息
    await db.prepare(
      `UPDATE account_providers
       SET provider_email = ?, provider_name = ?, provider_image_url = ?, last_used_at = ?
       WHERE account_id = ? AND provider = ? AND provider_id = ?`
    ).bind(
      userData.email || null,
      userData.name,
      userData.imageUrl || null,
      now,
      accountId,
      userData.provider,
      userData.providerId
    ).run()

    // 更新账户的 last_login_at
    await db.prepare(
      'UPDATE accounts SET last_login_at = ?, updated_at = ? WHERE id = ?'
    ).bind(now, now, accountId).run()

  } else {
    // Provider 不存在，需要查找或创建账户

    // 2. 如果有邮箱，查找是否有相同邮箱的账户
    let existingAccount: { id: string; email: string | null } | null = null

    if (userData.email) {
      // 先查找账户表中是否有该邮箱
      existingAccount = await db.prepare(
        'SELECT id, email FROM accounts WHERE email = ?'
      ).bind(userData.email).first<{ id: string; email: string | null }>() || null

      // 如果账户表中没有，查找 provider 表中是否有该邮箱
      if (!existingAccount) {
        const providerWithEmail = await db.prepare(
          'SELECT account_id FROM account_providers WHERE provider_email = ? LIMIT 1'
        ).bind(userData.email).first<{ account_id: string }>()

        if (providerWithEmail) {
          existingAccount = await db.prepare(
            'SELECT id, email FROM accounts WHERE id = ?'
          ).bind(providerWithEmail.account_id).first<{ id: string; email: string | null }>() || null
        }
      }
    }

    if (existingAccount) {
      // 3. 找到现有账户，关联新的 provider
      accountId = existingAccount.id

      // 如果账户没有邮箱，且当前 provider 有邮箱，更新账户邮箱
      if (!existingAccount.email && userData.email) {
        await db.prepare(
          'UPDATE accounts SET email = ?, name = ?, image_url = ?, updated_at = ?, last_login_at = ? WHERE id = ?'
        ).bind(
          userData.email,
          userData.name,
          userData.imageUrl || null,
          now,
          now,
          accountId
        ).run()
      } else {
        // 只更新登录时间和基本信息
        await db.prepare(
          'UPDATE accounts SET name = ?, image_url = ?, updated_at = ?, last_login_at = ? WHERE id = ?'
        ).bind(
          userData.name,
          userData.imageUrl || null,
          now,
          now,
          accountId
        ).run()
      }

      // 创建 account_providers 记录
      await db.prepare(
        `INSERT INTO account_providers
         (id, account_id, provider, provider_id, provider_email, provider_name, provider_image_url, created_at, last_used_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        generateProviderId(),
        accountId,
        userData.provider,
        userData.providerId,
        userData.email || null,
        userData.name,
        userData.imageUrl || null,
        now,
        now
      ).run()

    } else {
      // 4. 没有找到现有账户，创建新账户
      accountId = generateAccountId()

      await db.prepare(
        `INSERT INTO accounts (id, email, name, image_url, created_at, updated_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        accountId,
        userData.email || null, // 邮箱可以为空
        userData.name,
        userData.imageUrl || null,
        now,
        now,
        now
      ).run()

      // 创建 account_providers 记录
      await db.prepare(
        `INSERT INTO account_providers
         (id, account_id, provider, provider_id, provider_email, provider_name, provider_image_url, created_at, last_used_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        generateProviderId(),
        accountId,
        userData.provider,
        userData.providerId,
        userData.email || null,
        userData.name,
        userData.imageUrl || null,
        now,
        now
      ).run()
    }
  }

  return accountId
}

/**
 * 根据账户 ID 获取账户信息
 */
async function getAccountById(db: D1Database, accountId: string): Promise<{
  id: string
  email: string | null
  name: string | null
  image_url: string | null
}> {
  const account = await db.prepare(
    'SELECT id, email, name, image_url FROM accounts WHERE id = ?'
  ).bind(accountId).first<{
    id: string
    email: string | null
    name: string | null
    image_url: string | null
  }>()

  if (!account) {
    throw new Error('Account not found')
  }

  return account
}

/**
 * 生成账户 ID
 */
function generateAccountId(): string {
  return `acc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 生成 Provider ID
 */
function generateProviderId(): string {
  return `prov_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 生成会话 ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 生成令牌
 */
function generateToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
}

