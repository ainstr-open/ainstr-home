'use client'

import React from 'react'
import Header from '@/components/Header'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AgentPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen">
      <Header />

      <main style={{ paddingTop: 64 }}>
        <div className="coming-soon-container">
          <div className="coming-soon-content">
            <div className="coming-soon-icon">🚀</div>
            <h1 className="coming-soon-title">{t.comingSoon}</h1>
            <p className="coming-soon-description">
              {t.agentComingSoonDesc}
            </p>
            <div className="coming-soon-subtitle">
              {t.agentComingSoonSubtitle}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
