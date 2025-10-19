'use client'

import React from 'react'
import { CheckCircleOutlined, ClockCircleOutlined, HeartOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'

interface ServiceCardProps {
  title: string
  description: string
  category: string
  status: 'hosted' | 'local'
  license?: string
  developer?: string
  organization: string
  stats: {
    downloads: string
    views: string
    likes: number
  }
  icon: React.ReactNode
  url: string
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  category,
  status,
  license,
  developer,
  organization,
  stats,
  icon,
  url
}) => {
  const statusConfig = {
    hosted: {
      icon: <CheckCircleOutlined />,
      text: 'Hosted',
      class: 'status-hosted'
    },
    local: {
      icon: <ClockCircleOutlined />,
      text: 'Local',
      class: 'status-local'
    }
  }

  const formatNumber = (num: string) => {
    const number = parseFloat(num)
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}m`
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}k`
    }
    return num
  }

  return (
    <div
      className="service-card"
      onClick={() => window.open(url, '_blank')}
    >
      <div className="card-header">
        <div className="service-icon">
          {icon}
        </div>
        <div className="card-info">
          <h5 className="service-title">{title}</h5>
          <div className="card-tags">
            <span className={`status-tag ${statusConfig[status].class}`}>
              {statusConfig[status].icon}
              {statusConfig[status].text}
            </span>
            <span className="category-tag">{category}</span>
          </div>
        </div>
      </div>

      <p className="service-description">
        {description}
      </p>

      <div className="card-footer">
        <div className="org-info">
          <div className="org-avatar">
            {organization.charAt(1).toUpperCase()}
          </div>
          <span className="org-name">{organization}</span>
        </div>
        {license && (
          <span className="license-tag">{license}</span>
        )}
      </div>

      <div className="card-stats">
        <div className="stat-item">
          <DownloadOutlined className="stat-icon" />
          <span>{formatNumber(stats.downloads)}</span>
        </div>
        <div className="stat-item">
          <EyeOutlined className="stat-icon" />
          <span>{formatNumber(stats.views)}</span>
        </div>
        <div className="stat-item">
          <HeartOutlined className="stat-icon" />
          <span>{stats.likes}</span>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard

