// 国际化配置

export type Language = 'zh' | 'en'

export interface Translations {
  // Header
  logo: string
  mcpSquare: string
  agentZone: string
  theme: string
  language: string
  notifications: string
  user: string

  // Categories
  mcpServices: string
  mcpExperience: string
  searchPlaceholder: string
  totalServices: string

  // Service Grid
  serviceType: string
  hosted: string
  local: string
  all: string
  loadMore: string
  noServices: string
  tryOtherFilters: string

  // Coming Soon
  comingSoon: string
  agentComingSoonDesc: string
  agentComingSoonSubtitle: string

  // Promotional Banners
  mcpLab: string
  tutorial: string
  enterprise: string
}

export const translations: Record<Language, Translations> = {
  zh: {
    logo: 'ModelScope',
    mcpSquare: 'MCP广场',
    agentZone: 'Agent专区',
    theme: '主题',
    language: '中文',
    notifications: '通知',
    user: '用户',

    mcpServices: 'MCP 服务',
    mcpExperience: 'MCP体验',
    searchPlaceholder: '搜索MCP服务',
    totalServices: '个服务',

    serviceType: '服务类型:',
    hosted: 'Hosted',
    local: 'Local',
    all: '全部',
    loadMore: '加载更多服务',
    noServices: '暂无相关服务',
    tryOtherFilters: '请尝试其他筛选条件',

    comingSoon: 'Coming Soon',
    agentComingSoonDesc: 'Agent专区正在开发中，敬请期待',
    agentComingSoonSubtitle: 'We\'re working hard to bring you something amazing!',

    mcpLab: 'MCP 实验场',
    tutorial: '教程与实践',
    enterprise: '企业合作',
  },
  en: {
    logo: 'ModelScope',
    mcpSquare: 'MCP Square',
    agentZone: 'Agent Zone',
    theme: 'Theme',
    language: 'English',
    notifications: 'Notifications',
    user: 'User',

    mcpServices: 'MCP Services',
    mcpExperience: 'MCP Experience',
    searchPlaceholder: 'Search MCP Services',
    totalServices: 'services',

    serviceType: 'Service Type:',
    hosted: 'Hosted',
    local: 'Local',
    all: 'All',
    loadMore: 'Load More',
    noServices: 'No services found',
    tryOtherFilters: 'Please try other filters',

    comingSoon: 'Coming Soon',
    agentComingSoonDesc: 'Agent Zone is under development',
    agentComingSoonSubtitle: 'We\'re working hard to bring you something amazing!',

    mcpLab: 'MCP Lab',
    tutorial: 'Tutorial & Practice',
    enterprise: 'Enterprise',
  }
}

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.zh
}
