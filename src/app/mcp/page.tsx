import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import PromotionalBanners from '@/components/PromotionalBanners'
import ServiceCategories from '@/components/ServiceCategories'
import ServiceGrid from '@/components/ServiceGrid'

export const metadata: Metadata = {
  title: 'MCP广场',
  description: 'Ainstr MCP广场，聚合优质MCP资源，拓展模型智能边界。浏览数百个专业的MCP服务，包括浏览器自动化、搜索工具、开发者工具等。Browse premium MCP services including browser automation, search tools, and developer resources.',
  keywords: ['MCP广场', 'MCP服务', 'Model Context Protocol', '浏览器自动化', 'AI工具', 'AI Services', 'MCP Marketplace'],
  alternates: {
    canonical: '/mcp',
  },
  openGraph: {
    title: 'MCP广场 - Ainstr',
    description: '聚合优质MCP资源，拓展模型智能边界',
    url: 'https://ainstr.com/mcp',
    type: 'website',
  },
  twitter: {
    title: 'MCP广场 - Ainstr',
    description: '聚合优质MCP资源，拓展模型智能边界',
  },
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
