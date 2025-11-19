'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spin, message } from 'antd'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { updateUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const processingRef = useRef(false)
  const processedCodeRef = useRef<string | null>(null)

  useEffect(() => {
    // 防止重复执行：如果正在处理或已经处理过这个 code，直接返回
    if (processingRef.current) {
      return
    }

    // 直接从 URL 读取参数，避免 useSearchParams 需要 Suspense
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    // 如果已经处理过这个 code，直接返回
    if (code && processedCodeRef.current === code) {
      return
    }

    // 标记为正在处理
    processingRef.current = true
    if (code) {
      processedCodeRef.current = code
    }

    const handleCallback = async () => {
      try {
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

        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || '',
          image: data.user.image,
          provider: data.user.provider,
        }

        // 更新 AuthContext 中的用户信息，这样页面会立即显示
        updateUser(userData)

        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }

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
      } finally {
        // 处理完成后重置标记
        processingRef.current = false
      }
    }

    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 空依赖数组，只在组件挂载时执行一次

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Spin size="large" />
      <div style={{ color: '#666', fontSize: '14px' }}>
        {status === 'loading' && '正在处理登录...'}
        {status === 'success' && '登录成功，正在跳转...'}
        {status === 'error' && '登录失败，正在返回...'}
      </div>
    </div>
  )
}

