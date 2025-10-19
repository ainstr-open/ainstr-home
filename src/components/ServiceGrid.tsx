'use client'

import React, { useState } from 'react'
import ServiceCard from './ServiceCard'
import mcpData from '@/data/mcp-data.json'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCategory } from '@/contexts/CategoryContext'
import { getCategoryName } from '@/lib/categories'
import {
  SearchOutlined,
  CarOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  RobotOutlined,
  ChromeOutlined,
  GithubOutlined,
  SlackOutlined,
  FolderOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  LockOutlined
} from '@ant-design/icons'

interface Service {
  id: string
  title: string
  description: string
  category: string
  rawCategory?: string
  status: 'hosted' | 'local'
  license?: string
  organization: string
  stats: {
    downloads: string
    views: string
    likes: number
  }
  icon: React.ReactNode
  url: string
}

const ServiceGrid: React.FC = () => {
  const [serviceType, setServiceType] = useState<'hosted' | 'local' | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12 // 每页显示12个
  const { language, t } = useLanguage()
  const { selectedCategory } = useCategory()

  // 图标映射
  const iconMap: Record<string, React.ReactNode> = {
    'browser-automation': <ChromeOutlined />,
    'search': <SearchOutlined />,
    'developer-tools': <ThunderboltOutlined />,
    'entertainment-and-media': <PlayCircleOutlined />,
    'file-systems': <FolderOutlined />,
    'communication': <SlackOutlined />,
    'databases': <DatabaseOutlined />,
    'cloud-platforms': <CloudOutlined />,
    'research-and-data': <ExperimentOutlined />,
    'calendar-management': <CalendarOutlined />,
    'security': <LockOutlined />,
    'other': <ApiOutlined />,
  }

  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  // 从JSON数据转换为组件所需格式
  const allServices: Service[] = mcpData.servers.map((item: any) => {
    const category = Array.isArray(item.Category) ? item.Category[0] : (item.Category || 'other')

    return {
      id: item.Id,
      title: language === 'zh' ? (item.ChineseName || item.Name) : item.Name,
      description: language === 'zh' ? (item.AbstractCN || item.Abstract || '暂无描述') : (item.Abstract || item.AbstractCN || 'No description'),
      category: getCategoryName(category, language),
      status: item.Hosted ? 'hosted' : 'local',
      license: item.License,
      organization: item.Path || `@${item.Organization?.Name || 'unknown'}`,
      stats: {
        downloads: formatNumber(item.CallVolume || 0),
        views: formatNumber(item.ViewCount || 0),
        likes: item.Stars || 0
      },
      icon: iconMap[category] || <RobotOutlined />,
      url: `https://www.modelscope.cn/mcp/servers/${item.Path || item.Id}`,
      rawCategory: category // 保存原始分类用于筛选
    }
  })

  // 筛选服务
  const filteredServices = allServices.filter(service => {
    // 服务类型筛选
    const typeMatch = serviceType === 'all' || service.status === serviceType

    // 分类筛选
    const categoryMatch = !selectedCategory || service.rawCategory === selectedCategory

    return typeMatch && categoryMatch
  })

  // 分页
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const displayedServices = filteredServices.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredServices.length / pageSize)

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="service-grid-container">
      <div className="grid-header">
        <h4 className="grid-title">
          {t.mcpServices} <span style={{ color: '#999', fontSize: 14, fontWeight: 'normal' }}>
            ({displayedServices.length}/{filteredServices.length})
          </span>
        </h4>
        <div className="service-type-filter">
          <span className="filter-label">{t.serviceType}</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${serviceType === 'hosted' ? 'active' : ''}`}
              onClick={() => { setServiceType('hosted'); setCurrentPage(1); }}
            >
              {t.hosted}
            </button>
            <button
              className={`filter-btn ${serviceType === 'local' ? 'active' : ''}`}
              onClick={() => { setServiceType('local'); setCurrentPage(1); }}
            >
              {t.local}
            </button>
            <button
              className={`filter-btn ${serviceType === 'all' ? 'active' : ''}`}
              onClick={() => { setServiceType('all'); setCurrentPage(1); }}
            >
              {t.all}
            </button>
          </div>
        </div>
      </div>

      <div className="services-grid">
        {displayedServices.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">{t.noServices}</div>
          <div className="text-gray-500 text-sm">{t.tryOtherFilters}</div>
        </div>
      )}

      {currentPage < totalPages && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={handleLoadMore}>
            {t.loadMore} ({currentPage}/{totalPages})
          </button>
        </div>
      )}
    </div>
  )
}

export default ServiceGrid
