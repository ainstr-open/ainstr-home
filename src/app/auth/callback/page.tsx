'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spin, message } from 'antd'
import { setAuthUser } from '@/contexts/AuthContext'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        if (error) {
          message.error(`登录失败: ${error}`)
          setStatus('error')
          setTimeout(() => router.push('/mcp'), 2000)
          return
        }

        if (!code || !state) {
          message.error('缺少必要的授权参数')
          setStatus('error')
          setTimeout(() => router.push('/mcp'), 2000)
          return
        }

        const savedState = localStorage.getItem('oauth_state')
        if (state !== savedState) {
          message.error('状态验证失败，请重试')
          setStatus('error')
          setTimeout(() => router.push('/mcp'), 2000)
          return
        }

        const provider = localStorage.getItem('oauth_provider') as 'google' | 'github' | null
        if (!provider) {
          message.error('无法识别登录提供商')
          setStatus('error')
          setTimeout(() => router.push('/mcp'), 2000)
          return
        }

        // 调用 Cloudflare Worker API 处理 OAuth 回调
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin
        message.info('正在处理登录信息...')

        const response = await fetch(`${apiUrl}/api/auth/${provider}/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '登录失败')
        }

        const data = await response.json()

        // 保存用户信息和 token
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || '', // 邮箱可能为空
          image: data.user.image,
          provider: data.user.provider,
        }

        setAuthUser(userData)

        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }

        // 清理临时数据
        localStorage.removeItem('oauth_state')
        localStorage.removeItem('oauth_provider')

        message.success('登录成功！')
        setStatus('success')
        setTimeout(() => router.push('/mcp'), 1000)

      } catch (error) {
        console.error('Auth callback error:', error)
        message.error('登录处理失败')
        setStatus('error')
        setTimeout(() => router.push('/mcp'), 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Spin size="large" />
      <div style={{ color: '#666', fontSize: '14px' }}>
        {status === 'loading' && '正在处理登录...'}
        {status === 'success' && '登录成功，正在跳转...'}
        {status === 'error' && '登录失败，正在返回...'}
      </div>
    </div>
  )
}

