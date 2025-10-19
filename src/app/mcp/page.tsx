import React from 'react'
import Header from '@/components/Header'
import PromotionalBanners from '@/components/PromotionalBanners'
import ServiceCategories from '@/components/ServiceCategories'
import ServiceGrid from '@/components/ServiceGrid'

export const metadata = {
  title: 'MCP广场 - ModelScope',
  description: 'ModelScope MCP广场，聚合优质MCP资源，拓展模型智能边界',
}

export default function MCPPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main style={{ paddingTop: 64 }}>
        <PromotionalBanners />

        <div className="main-content">
          <div className="content-container">
            <ServiceCategories />
            <ServiceGrid />
          </div>
        </div>
      </main>
    </div>
  )
}
