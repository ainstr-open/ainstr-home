// 分类名称映射

export const categoryNameMap: Record<string, { zh: string; en: string }> = {
  'developer-tools': { zh: '开发者工具', en: 'Developer Tools' },
  'search': { zh: '搜索工具', en: 'Search' },
  'calendar-management': { zh: '日历管理', en: 'Calendar Management' },
  'other': { zh: '其他', en: 'Other' },
  'browser-automation': { zh: '浏览器自动化', en: 'Browser Automation' },
  'databases': { zh: '数据库', en: 'Databases' },
  'knowledge-and-memory': { zh: '知识与记忆', en: 'Knowledge & Memory' },
  'communication': { zh: '通讯协作', en: 'Communication' },
  'research-and-data': { zh: '研究与数据', en: 'Research & Data' },
  'file-systems': { zh: '文件系统', en: 'File Systems' },
  'cloud-platforms': { zh: '云平台', en: 'Cloud Platforms' },
  'finance': { zh: '金融', en: 'Finance' },
  'os-automation': { zh: '系统自动化', en: 'OS Automation' },
  'entertainment-and-media': { zh: '娱乐与媒体', en: 'Entertainment & Media' },
  'note-taking': { zh: '笔记工具', en: 'Note Taking' },
  'location-services': { zh: '位置服务', en: 'Location Services' },
  'web3': { zh: 'Web3', en: 'Web3' },
  'ai-ml': { zh: 'AI/ML', en: 'AI/ML' },
  'productivity': { zh: '生产力工具', en: 'Productivity' },
  'security': { zh: '安全工具', en: 'Security' },
  'version-control': { zh: '版本控制', en: 'Version Control' },
  'code-analysis': { zh: '代码分析', en: 'Code Analysis' },
  'monitoring': { zh: '监控', en: 'Monitoring' },
  'testing': { zh: '测试', en: 'Testing' },
  'deployment': { zh: '部署', en: 'Deployment' },
  'documentation': { zh: '文档', en: 'Documentation' },
}

export function getCategoryName(category: string, language: 'zh' | 'en'): string {
  // 处理undefined或空值
  if (!category) {
    return language === 'zh' ? '其他' : 'Other'
  }
  
  const mapping = categoryNameMap[category]
  if (mapping) {
    return mapping[language]
  }
  
  // 如果没有映射，返回原始值的首字母大写形式
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
