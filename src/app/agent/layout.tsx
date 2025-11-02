import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent专区',
  description: 'Agent专区即将上线，敬请期待。Agent Zone Coming Soon - Stay tuned for AI agent services and tools.',
  keywords: ['Agent专区', 'AI Agent', 'Agent工具', 'AI Services'],
  alternates: {
    canonical: '/agent',
  },
  openGraph: {
    title: 'Agent专区 - Ainstr',
    description: 'Agent专区即将上线，敬请期待',
    url: 'https://ainstr.com/agent',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

