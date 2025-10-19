import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ConfigProvider from 'antd/lib/config-provider'
import zhCN from 'antd/lib/locale/zh_CN'
import Providers from '@/components/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ModelScope MCP 广场 - 聚合优质MCP资源，拓展模型智能边界',
  description: 'ModelScope MCP广场是一个专业的AI模型和服务市场，提供浏览器自动化、搜索工具、开发者工具等多种MCP服务，支持模型上下文协议，助力AI应用开发。',
  keywords: 'ModelScope, MCP, AI模型, 模型上下文协议, 浏览器自动化, 搜索工具, 开发者工具, AI服务',
  authors: [{ name: 'ModelScope Team' }],
  creator: 'ModelScope',
  publisher: 'ModelScope',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://modelscope.cn'),
  alternates: {
    canonical: '/mcp',
  },
  openGraph: {
    title: 'ModelScope MCP 广场',
    description: '聚合优质MCP资源，拓展模型智能边界',
    url: 'https://modelscope.cn/mcp',
    siteName: 'ModelScope',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ModelScope MCP 广场',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModelScope MCP 广场',
    description: '聚合优质MCP资源，拓展模型智能边界',
    images: ['/og-image.jpg'],
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
    google: 'your-google-verification-code',
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ModelScope MCP 广场",
              "description": "聚合优质MCP资源，拓展模型智能边界",
              "url": "https://modelscope.cn/mcp",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://modelscope.cn/mcp?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
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

