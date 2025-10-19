'use client'

import React, { useState } from 'react'
import { RightOutlined } from '@ant-design/icons'
import mcpData from '@/data/mcp-data.json'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCategory } from '@/contexts/CategoryContext'
import { getCategoryName } from '@/lib/categories'

interface Category {
  Value: string
  Count: number
}

const ServiceCategories: React.FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const { language, t } = useLanguage()
  const { selectedCategory, setSelectedCategory } = useCategory()

  // 从数据文件获取分类
  const categories: Category[] = mcpData.categories

  const filteredCategories = categories.filter(category => {
    const displayName = getCategoryName(category.Value, language)
    return displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
           category.Value.toLowerCase().includes(searchValue.toLowerCase())
  })

  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue === selectedCategory ? '' : categoryValue)
  }

  return (
    <div className="categories-sidebar">
      <div className="sidebar-header">
        <h4 className="sidebar-title">{t.mcpServices}</h4>
        <button className="experience-btn">
          {t.mcpExperience}
          <RightOutlined />
        </button>
      </div>

      <div className="categories-search">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="categories-count">
        {mcpData.totalCount.toLocaleString()} {t.totalServices}
      </div>

      <div className="categories-list">
        {filteredCategories.map((category) => (
          <div
            key={category.Value}
            className={`category-item ${
              selectedCategory === category.Value ? 'active' : ''
            }`}
            onClick={() => handleCategorySelect(category.Value)}
          >
            <span className="category-name">
              {getCategoryName(category.Value, language)}
            </span>
            <span className="category-count">{category.Count}</span>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {language === 'zh' ? '未找到相关服务' : 'No services found'}
        </div>
      )}
    </div>
  )
}

export default ServiceCategories
