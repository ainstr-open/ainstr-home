'use client'

import React from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { CategoryProvider } from '@/contexts/CategoryContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CategoryProvider>
        {children}
      </CategoryProvider>
    </LanguageProvider>
  )
}
