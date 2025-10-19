# ModelScope MCP广场 - 使用指南

## 🌍 多语言功能

### 如何切换语言

1. 点击页面右上角的语言下拉菜单
2. 选择"中文"或"English"
3. 页面会立即切换语言，设置会保存在浏览器localStorage中

### 支持的语言

- 🇨🇳 **中文** (默认)
  - 所有UI文本
  - 服务标题优先显示中文名
  - 服务描述优先显示中文版本

- 🇬🇧 **English**
  - All UI texts
  - Service titles in English
  - Service descriptions in English

### 多语言覆盖范围

#### Header (顶部导航)
- Logo文本
- MCP广场 / MCP Square
- Agent专区 / Agent Zone
- 语言选择器
- 用户菜单
- 通知

#### 侧边栏分类
- MCP服务 / MCP Services
- 搜索占位符
- 服务数量统计
- 分类名称（自动映射）

#### 服务网格
- 服务类型筛选器
- Hosted / Local / 全部(All)
- 加载更多按钮
- 空状态提示

#### Coming Soon页面
- 标题和描述文本
- 副标题

## 📊 数据管理

### 当前数据状态

```
✅ 分类数: 81个
✅ 服务数: 300条 (共5,510条)
✅ 数据源: ModelScope API
```

### 如何更新数据

#### 方法1: 使用Python脚本（推荐）

```bash
python3 scripts/fetch_all_pages.py
```

#### 方法2: 手动更新Cookie

1. 访问 https://modelscope.cn/mcp
2. 打开浏览器开发者工具 (F12)
3. 切换到 **Network** 标签
4. 刷新页面
5. 找到名为 `mcpServers` 的请求
6. 右键点击 → Copy → Copy as cURL
7. 从cURL命令中提取Cookie值
8. 更新 `scripts/fetch_all_pages.py`:

```python
COOKIE = '你的新Cookie值'
```

9. 运行脚本:

```bash
python3 scripts/fetch_all_pages.py
```

### Cookie示例

```python
COOKIE = 'cna=...; csrf_token=...; t=...; acw_tc=...; ...'
CSRF_TOKEN = '从Cookie中提取的CSRF值'
```

### 数据文件结构

**位置**: `src/data/mcp-data.json`

```json
{
  "categories": [
    {
      "Value": "developer-tools",
      "Count": 1481
    }
  ],
  "servers": [
    {
      "Id": "2756",
      "Name": "minimax-mcp",
      "ChineseName": "MiniMax MCP",
      "Abstract": "English description...",
      "AbstractCN": "中文描述...",
      "Category": ["entertainment-and-multimedia"],
      "Stars": 32,
      "License": "MIT License",
      "Organization": {"Name": "MiniMax-AI"},
      "Path": "@MiniMax-AI",
      "CallVolume": 132495873,
      "ViewCount": 21382,
      "Hosted": true
    }
  ],
  "totalCount": 5510,
  "fetchedCount": 300
}
```

### API限制说明

⚠️ **重要提示**:

1. **Cookie过期**: Cookie通常24小时后过期，需要重新获取
2. **速率限制**: API有防护机制，建议:
   - 每页请求间隔 0.8-1秒
   - 每10页休息2秒
   - 避免短时间内大量请求
3. **请求限制**: 通常在第4页之后会遇到限制，这是正常的
4. **当前策略**: 已获取300条数据足够展示功能

## 🎨 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
http://localhost:3000
```

### 构建生产版本

```bash
npm run build
npm start
```

### 项目目录

```
src/
├── app/                    # 页面路由
│   ├── mcp/               # MCP广场
│   ├── agent/             # Agent专区
│   └── layout.tsx         # 根布局
├── components/            # 组件
│   ├── Header.tsx         # 顶部导航(支持多语言)
│   ├── ServiceCategories.tsx  # 分类侧边栏(支持多语言)
│   ├── ServiceGrid.tsx    # 服务网格(支持多语言)
│   └── Providers.tsx      # Context提供者
├── contexts/              # React Context
│   └── LanguageContext.tsx  # 语言上下文
├── lib/                   # 工具函数
│   └── i18n.ts           # 国际化配置
├── data/                  # 数据文件
│   └── mcp-data.json     # MCP数据
└── types/                 # TypeScript类型
    └── mcp-data.d.ts     # 数据类型定义
```

## 🔧 添加新语言

### 步骤1: 更新i18n配置

编辑 `src/lib/i18n.ts`:

```typescript
export type Language = 'zh' | 'en' | 'ja'  // 添加日语

export const translations: Record<Language, Translations> = {
  zh: { ... },
  en: { ... },
  ja: {  // 新增日语翻译
    mcpSquare: 'MCPスクエア',
    agentZone: 'エージェントゾーン',
    // ... 其他翻译
  }
}
```

### 步骤2: 更新Header语言选择器

编辑 `src/components/Header.tsx`:

```typescript
const languageMenuItems: MenuProps['items'] = [
  { key: 'zh', label: '中文' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },  // 新增
]
```

### 步骤3: 测试

1. 切换语言
2. 检查所有页面文本
3. 验证localStorage保存

## 📈 性能优化建议

### 数据加载

- ✅ 已实现分页加载
- ✅ 每页12个服务
- ✅ 按需加载更多

### 图片优化

```tsx
// 使用Next.js Image组件
import Image from 'next/image'

<Image
  src={iconUrl}
  alt={title}
  width={48}
  height={48}
  loading="lazy"
/>
```

### 缓存策略

```typescript
// 在ServiceGrid中添加缓存
const [cachedData, setCachedData] = useState(null)

useEffect(() => {
  const cached = localStorage.getItem('mcp-services')
  if (cached) {
    setCachedData(JSON.parse(cached))
  }
}, [])
```

## 🐛 故障排除

### 问题1: 数据获取失败

**原因**: Cookie过期或速率限制

**解决**:
1. 更新Cookie (参见上文)
2. 增加请求延迟
3. 分批获取数据

### 问题2: 语言切换不生效

**原因**: localStorage未保存

**解决**:
1. 检查浏览器控制台是否有错误
2. 清除浏览器缓存
3. 确认localStorage权限

### 问题3: 页面显示空白

**原因**: 数据文件为空或格式错误

**解决**:
```bash
# 检查数据文件
cat src/data/mcp-data.json | python3 -m json.tool

# 重新获取数据
python3 scripts/fetch_all_pages.py
```

## 📞 技术支持

遇到问题？查看这些资源:

- [Next.js文档](https://nextjs.org/docs)
- [Ant Design组件](https://ant.design/components/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Context API](https://react.dev/reference/react/useContext)

## 🎯 下一步功能

- [ ] 搜索功能
- [ ] 分类筛选（点击分类筛选服务）
- [ ] 服务详情页
- [ ] 收藏/点赞功能
- [ ] 更多语言支持
- [ ] 服务评论系统

---

**更新日期**: 2025-10-18
**版本**: 1.1.0 (多语言支持版)
