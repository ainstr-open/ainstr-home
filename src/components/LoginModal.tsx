'use client'

import React from 'react'
import { Modal, Button, Space } from 'antd'
import { GoogleOutlined, GithubOutlined, RocketOutlined, ThunderboltOutlined, StarOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './LoginModal.module.css'

interface LoginModalProps {
  open: boolean
  onCancel: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onCancel }) => {
  const { login } = useAuth()
  const { t, language } = useLanguage()

  const handleGoogleLogin = () => {
    login('google')
  }

  const handleGithubLogin = () => {
    login('github')
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={900}
      styles={{
        content: {
          borderRadius: '16px',
          overflow: 'hidden',
          padding: 0,
        },
        body: {
          padding: 0,
        },
      }}
      destroyOnClose
    >
      <div className={styles.loginModalWrapper}>
        {/* 左侧交互区域 */}
        <div className={styles.loginModalLeft}>
          <div className={styles.leftContent}>
            <div className={styles.brandSection}>
              <div className={styles.brandIcon}>
                <RocketOutlined />
              </div>
              <h1 className={styles.brandTitle}>
                {language === 'zh' ? 'AI for everyone' : 'AI for everyone'}
              </h1>
              <p className={styles.brandSubtitle}>
                {language === 'zh'
                  ? '让模型开发使用更简单'
                  : 'Make model development and use simpler'}
              </p>
            </div>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <StarOutlined className={styles.featureIcon} />
                <span>
                  {language === 'zh'
                    ? '聚合优质MCP资源，拓展模型智能边界'
                    : 'Aggregated premium MCP resources to expand model intelligence'}
                </span>
              </div>
              <div className={styles.featureItem}>
                <ThunderboltOutlined className={styles.featureIcon} />
                <span>
                  {language === 'zh'
                    ? '专业的AI模型和服务市场'
                    : 'Professional AI models and services marketplace'}
                </span>
              </div>
              <div className={styles.featureItem}>
                <RocketOutlined className={styles.featureIcon} />
                <span>
                  {language === 'zh'
                    ? '支持多种登录方式，安全便捷'
                    : 'Multiple login methods, secure and convenient'}
                </span>
              </div>
            </div>

            <div className={styles.leftFooter}>
              <p className={styles.leftFooterText}>
                {language === 'zh'
                  ? '加入数千名开发者的社区'
                  : 'Join a community of thousands of developers'}
              </p>
            </div>
          </div>
        </div>

        {/* 右侧登录区域 */}
        <div className={styles.loginModalRight}>
          <div className={styles.loginModalContent}>
            {/* 标题 */}
            <div className={styles.loginModalHeader}>
              <h2 className={styles.loginModalTitle}>
                {language === 'zh' ? '欢迎来到 Ainstr' : 'Welcome to Ainstr'}
              </h2>
              <p className={styles.loginModalSubtitle}>
                {language === 'zh'
                  ? '使用以下方式登录以继续'
                  : 'Sign in with one of the following to continue'}
              </p>
            </div>

            {/* 登录按钮区域 */}
            <div className={styles.loginButtonsContainer}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Google 登录按钮 */}
                <Button
                  type="default"
                  size="large"
                  icon={<GoogleOutlined style={{ color: '#4285f4', fontSize: 20, marginRight: 12 }} />}
                  onClick={handleGoogleLogin}
                  className={`${styles.loginButton} ${styles.googleLoginButton}`}
                  block
                >
                  <span className={styles.loginButtonText}>
                    {language === 'zh' ? '使用 Google 登录' : 'Continue with Google'}
                  </span>
                </Button>

                {/* GitHub 登录按钮 */}
                <Button
                  type="default"
                  size="large"
                  icon={<GithubOutlined style={{ color: '#24292e', fontSize: 20, marginRight: 12 }} />}
                  onClick={handleGithubLogin}
                  className={`${styles.loginButton} ${styles.githubLoginButton}`}
                  block
                >
                  <span className={styles.loginButtonText}>
                    {language === 'zh' ? '使用 GitHub 登录' : 'Continue with GitHub'}
                  </span>
                </Button>
              </Space>
            </div>

            {/* 底部提示 */}
            <div className={styles.loginModalFooter}>
              <p className={styles.loginPrivacyText}>
                {language === 'zh'
                  ? '登录即表示您同意我们的服务条款和隐私政策'
                  : 'By signing in, you agree to our Terms of Service and Privacy Policy'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default LoginModal

