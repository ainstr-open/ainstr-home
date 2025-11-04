import { Env } from '../../types'

/**
 * 获取当前用户信息
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
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
      `SELECT s.*, a.id as account_id, a.email, a.name, a.image_url
       FROM account_sessions s
       JOIN accounts a ON s.account_id = a.id
       WHERE s.token = ? AND s.expires_at > ?`
    ).bind(token, Date.now()).first<{
      account_id: string
      email: string | null
      name: string | null
      image_url: string | null
    }>()

    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 获取用户使用的最后一个登录方式
    const lastProvider = await env.DB.prepare(
      `SELECT provider FROM account_providers
       WHERE account_id = ?
       ORDER BY last_used_at DESC
       LIMIT 1`
    ).bind(session.account_id).first<{ provider: string }>()

    return new Response(JSON.stringify({
      id: session.account_id,
      email: session.email,
      name: session.name || 'User',
      image: session.image_url,
      provider: lastProvider?.provider || null,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

