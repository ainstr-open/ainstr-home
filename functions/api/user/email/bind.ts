import { Env, D1Database } from '../../../types'

/**
 * 绑定邮箱到账户
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  try {
    // 从请求头获取 token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.substring(7)

    // 查找会话
    const session = await env.DB.prepare(
      `SELECT account_id FROM account_sessions
       WHERE token = ? AND expires_at > ?`
    ).bind(token, Date.now()).first<{ account_id: string }>()

    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { email } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 检查邮箱是否已被其他账户使用
    const existingAccount = await env.DB.prepare(
      'SELECT id FROM accounts WHERE email = ? AND id != ?'
    ).bind(email, session.account_id).first<{ id: string }>()

    if (existingAccount) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 检查 provider 中是否有相同的邮箱（可能已关联）
    const providerWithEmail = await env.DB.prepare(
      'SELECT account_id FROM account_providers WHERE provider_email = ? AND account_id != ? LIMIT 1'
    ).bind(email, session.account_id).first<{ account_id: string }>()

    if (providerWithEmail) {
      // 如果另一个账户使用了这个邮箱，可以考虑合并账户（这里简化处理，拒绝绑定）
      return new Response(JSON.stringify({ error: 'Email already associated with another account' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 更新账户邮箱
    const now = Math.floor(Date.now() / 1000)
    await env.DB.prepare(
      'UPDATE accounts SET email = ?, updated_at = ? WHERE id = ?'
    ).bind(email, now, session.account_id).run()

    // 同时更新所有 provider 的 provider_email（如果为空）
    await env.DB.prepare(
      `UPDATE account_providers
       SET provider_email = ?
       WHERE account_id = ? AND (provider_email IS NULL OR provider_email = '')`
    ).bind(email, session.account_id).run()

    return new Response(JSON.stringify({ success: true, email }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Bind email error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

