'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string // 前端显示用，可能为空字符串
  image?: string
  provider: 'google' | 'github'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (provider: 'google' | 'github') => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从 localStorage 恢复用户信息，或从 API 获取
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('auth_token')

      if (savedUser && token) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)

          // 验证 token 是否有效
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin
          const response = await fetch(`${apiUrl}/api/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const currentUser = await response.json()
            const updatedUser: User = {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email || '', // 邮箱可能为空
              image: currentUser.image,
              provider: currentUser.provider as 'google' | 'github',
            }
            setUserData(updatedUser)
          } else {
            // Token 无效，清除数据
            localStorage.removeItem('user')
            localStorage.removeItem('auth_token')
            setUser(null)
          }
        } catch (error) {
          console.error('Failed to restore user:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('auth_token')
        }
      }

      setLoading(false)
    }

    initAuth()

    // 处理 OAuth 回调
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        // 清理 URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }

      if (code && state) {
        const provider = localStorage.getItem('oauth_provider') as 'google' | 'github' | null
        if (provider) {
          handleOAuthCallbackCode(provider, code, state)
            .then(() => {
              // 清理 URL
              window.history.replaceState({}, document.title, window.location.pathname)
              localStorage.removeItem('oauth_provider')
            })
            .catch((error) => {
              console.error('OAuth callback failed:', error)
              // 清理 URL
              window.history.replaceState({}, document.title, window.location.pathname)
              localStorage.removeItem('oauth_provider')
            })
        }
      }
    }

    handleOAuthCallback()
  }, [])

  const handleOAuthCallbackCode = async (
    provider: 'google' | 'github',
    code: string,
    state: string
  ): Promise<User> => {
    try {
      // 调用 Cloudflare Worker API 处理 OAuth 回调
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin
      const response = await fetch(`${apiUrl}/api/auth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Authentication failed')
      }

      const data = await response.json()

      // 保存用户信息和 token
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email || '', // 邮箱可能为空
        image: data.user.image,
        provider: data.user.provider,
      }

      setUserData(userData)

      // 保存 token 到 localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }

      return userData
    } catch (error) {
      console.error('OAuth callback error:', error)
      throw error
    }
  }

  const login = (provider: 'google' | 'github') => {
    // 保存 provider 信息用于回调
    localStorage.setItem('oauth_provider', provider)

    // 生成 state 用于防止 CSRF 攻击
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('oauth_state', state)

    // OAuth 授权 URL
    const redirectUri = `${window.location.origin}/auth/callback`

    if (provider === 'google') {
      // Google OAuth 配置
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
      const scope = 'openid email profile'
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}&` +
        `access_type=online`

      window.location.href = googleAuthUrl
    } else if (provider === 'github') {
      // GitHub OAuth 配置
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || ''
      const scope = 'user:email'
      const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scope}&` +
        `state=${state}`

      window.location.href = githubAuthUrl
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
  }

  const setUserData = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 导出 setUserData 供回调页面使用
export function setAuthUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

