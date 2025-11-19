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
  updateUser: (userData: User) => void
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
  }, [])

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

  const updateUser = (userData: User) => {
    setUserData(userData)
  }

  // 监听 localStorage 变化，以便在多个标签页之间同步用户状态
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue)
          setUser(userData)
        } catch (error) {
          console.error('Failed to parse user data from storage:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
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

