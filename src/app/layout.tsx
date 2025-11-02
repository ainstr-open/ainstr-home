import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ConfigProvider from 'antd/lib/config-provider'
import zhCN from 'antd/lib/locale/zh_CN'
import Providers from '@/components/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Ainstr MCP 广场 - 聚合优质MCP资源，拓展模型智能边界',
    template: '%s | Ainstr',
  },
  description: 'Ainstr MCP广场是一个专业的AI模型和服务市场，提供浏览器自动化、搜索工具、开发者工具等多种MCP服务，支持模型上下文协议(Model Context Protocol)，助力AI应用开发。Discover premium MCP services, browser automation, search tools, and developer resources for AI applications.',
  keywords: ['Ainstr', 'MCP', 'Model Context Protocol', 'AI模型', '模型上下文协议', '浏览器自动化', '搜索工具', '开发者工具', 'AI服务', 'AI Services', 'Machine Learning', 'Artificial Intelligence'],
  authors: [{ name: 'Ainstr Team', url: 'https://ainstr.com' }],
  creator: 'Ainstr',
  publisher: 'Ainstr',
  applicationName: 'Ainstr MCP Square',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ainstr.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': 'https://ainstr.com',
      'en-US': 'https://ainstr.com',
    },
  },
  openGraph: {
    title: 'Ainstr MCP 广场 - 聚合优质MCP资源',
    description: '聚合优质MCP资源，拓展模型智能边界。Ainstr MCP Square - Premium MCP services marketplace for AI applications.',
    url: 'https://ainstr.com',
    siteName: 'Ainstr',
    images: [
      {
        url: 'https://ainstr.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ainstr MCP 广场',
      },
    ],
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ainstr MCP 广场',
    description: '聚合优质MCP资源，拓展模型智能边界',
    images: ['https://ainstr.com/og-image.jpg'],
    creator: '@ainstr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console验证码，需要在Google Search Console获取后填入
    // google: 'your-google-verification-code',
  },
  category: 'Technology',
  classification: 'AI Services Marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#667eea" />
        {/* 网站结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Ainstr MCP 广场",
              "alternateName": "Ainstr MCP Square",
              "description": "聚合优质MCP资源，拓展模型智能边界。Ainstr MCP Square - Premium MCP services marketplace for AI applications.",
              "url": "https://ainstr.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://ainstr.com/mcp?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "inLanguage": ["zh-CN", "en-US"],
              "publisher": {
                "@type": "Organization",
                "name": "Ainstr",
                "url": "https://ainstr.com"
              }
            })
          }}
        />
        {/* 组织结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Ainstr",
              "url": "https://ainstr.com",
              "logo": "https://ainstr.com/logo.png",
              "sameAs": [],
              "description": "Ainstr - AI Services Marketplace"
            })
          }}
        />
        {/* 面包屑导航结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "首页",
                  "item": "https://ainstr.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "MCP广场",
                  "item": "https://ainstr.com/mcp"
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ConfigProvider locale={zhCN}>
          <ClientProviders>
            {children}
          </ClientProviders>
        </ConfigProvider>
      </body>
    </html>
  )
}

function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}

