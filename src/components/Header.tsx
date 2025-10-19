'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Layout, Menu, Button, Dropdown, Badge, Avatar, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  BellOutlined,
  GlobalOutlined,
  UserOutlined,
  DownOutlined,
  MenuOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useLanguage } from '@/contexts/LanguageContext'

const { Header: AntHeader } = Layout

const Header: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [current, setCurrent] = useState('mcp')
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    // 根据当前路径设置选中的菜单项
    if (pathname?.includes('/agent')) {
      setCurrent('agent')
    } else {
      setCurrent('mcp')
    }
  }, [pathname])

  const mainMenuItems: MenuProps['items'] = [
    {
      key: 'mcp',
      label: t.mcpSquare,
      icon: <RocketOutlined />,
    },
    { key: 'agent', label: t.agentZone },
  ]

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', label: language === 'zh' ? '个人中心' : 'Profile', icon: <UserOutlined /> },
    { key: 'settings', label: language === 'zh' ? '设置' : 'Settings' },
    { type: 'divider' },
    { key: 'logout', label: language === 'zh' ? '退出登录' : 'Logout' },
  ]

  const languageMenuItems: MenuProps['items'] = [
    { key: 'zh', label: '中文' },
    { key: 'en', label: 'English' },
  ]

  const handleLanguageChange: MenuProps['onClick'] = ({ key }) => {
    setLanguage(key as 'zh' | 'en')
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setCurrent(key)
    // 路由跳转
    if (key === 'mcp') {
      router.push('/mcp')
    } else if (key === 'agent') {
      router.push('/agent')
    }
  }

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        padding: 0,
        height: 64,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 48px',
        gap: '24px'
      }}>
        {/* Logo */}
        <div className="logo-container" style={{ marginRight: '32px', cursor: 'pointer' }} onClick={() => router.push('/mcp')}>
          <div className="logo-icon">A</div>
          <span className="logo-text">Ainstr</span>
        </div>

        {/* Main Navigation - MCP广场 & Agent专区 */}
        <Menu
          mode="horizontal"
          selectedKeys={[current]}
          items={mainMenuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            lineHeight: '64px',
          }}
          className="main-menu"
        />

        {/* Right Side Actions */}
        <Space size={16} style={{ marginLeft: 'auto' }}>
          {/* Theme Toggle */}
          <Button
            type="text"
            icon={<GlobalOutlined />}
            className="action-btn"
          />

          {/* Language Selector */}
          <Dropdown menu={{ items: languageMenuItems, onClick: handleLanguageChange }} placement="bottomRight">
            <Button type="text" className="action-btn">
              {t.language} <DownOutlined style={{ fontSize: 12 }} />
            </Button>
          </Dropdown>

          {/* Notifications */}
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="action-btn"
            />
          </Badge>

          {/* User Menu */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }} className="user-menu">
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ fontSize: 14, color: '#666' }}>{t.user}</span>
              <DownOutlined style={{ fontSize: 12, color: '#999' }} />
            </Space>
          </Dropdown>

          {/* Mobile Menu */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            className="action-btn mobile-menu-btn"
          />
        </Space>
      </div>
    </AntHeader>
  )
}

export default Header
