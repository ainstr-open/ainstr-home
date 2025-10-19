'use client'

import React from 'react'
import { RocketOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons'

interface BannerCardProps {
  title: string
  description: string
  icon: React.ReactNode
  gradientClass: string
  emoji?: string
}

const BannerCard: React.FC<BannerCardProps> = ({ title, description, icon, gradientClass, emoji }) => {
  return (
    <div className="banner-card">
      <div className={`banner-content ${gradientClass}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="banner-title">
              {title} {emoji && <span>{emoji}</span>}
            </h4>
            <p className="banner-description">
              {description}
            </p>
          </div>
          <div className="banner-icon">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

const PromotionalBanners: React.FC = () => {
  const banners = [
    {
      title: "New MCP 实验场",
      description: "探索开源模型与MCP Server 的自由组合和碰撞",
      icon: <RocketOutlined />,
      gradientClass: "banner-purple",
      emoji: "🔥最新SOTA模型..."
    },
    {
      title: "ModelScope MCP 教程与实践",
      description: "了解和学习 MCP、观摩和交流最佳实践",
      icon: <SettingOutlined />,
      gradientClass: "banner-green",
    },
    {
      title: "New ModelScope MCP x Siemens",
      description: "在Xcelerator AI & API 开放平台中使用ModelScope...",
      icon: <ThunderboltOutlined />,
      gradientClass: "banner-blue",
    }
  ]

  return (
    <section className="banners-section">
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px' }}>
        <div className="banners-grid">
          {banners.map((banner, index) => (
            <BannerCard
              key={index}
              title={banner.title}
              description={banner.description}
              icon={banner.icon}
              gradientClass={banner.gradientClass}
              emoji={banner.emoji}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PromotionalBanners

