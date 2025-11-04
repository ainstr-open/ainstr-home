'use client'

import React from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { CategoryProvider } from '@/contexts/CategoryContext'
import { AuthProvider } from '@/contexts/AuthContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CategoryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </CategoryProvider>
    </LanguageProvider>
  )
}
