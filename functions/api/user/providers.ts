import { Env } from '../../types'

/**
 * 获取账户关联的所有登录方式
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
      `SELECT account_id FROM account_sessions
       WHERE token = ? AND expires_at > ?`
    ).bind(token, Date.now()).first<{ account_id: string }>()

    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 获取所有关联的登录方式
    const providers = await env.DB.prepare(
      `SELECT provider, provider_email, provider_name, provider_image_url, created_at, last_used_at
       FROM account_providers
       WHERE account_id = ?
       ORDER BY last_used_at DESC`
    ).bind(session.account_id).all<{
      provider: string
      provider_email: string | null
      provider_name: string | null
      provider_image_url: string | null
      created_at: number
      last_used_at: number
    }>()

    return new Response(JSON.stringify({
      providers: providers.results || [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Get providers error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * 删除账户关联的某个登录方式
 */
export async function onRequestDelete(context: { request: Request; env: Env }): Promise<Response> {
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

    const url = new URL(request.url)
    const provider = url.searchParams.get('provider')
    const providerId = url.searchParams.get('provider_id')

    if (!provider || !providerId) {
      return new Response(JSON.stringify({ error: 'Missing provider or provider_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 检查至少保留一个登录方式
    const providerCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM account_providers WHERE account_id = ?'
    ).bind(session.account_id).first<{ count: number }>()

    if (providerCount && providerCount.count <= 1) {
      return new Response(JSON.stringify({ error: 'Cannot remove the last login method. Please bind an email first.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 删除登录方式
    await env.DB.prepare(
      'DELETE FROM account_providers WHERE account_id = ? AND provider = ? AND provider_id = ?'
    ).bind(session.account_id, provider, providerId).run()

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Delete provider error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

