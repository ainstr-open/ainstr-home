# ModelScope MCP广场 - 克隆版

基于Next.js + Ant Design + Tailwind CSS 开发的ModelScope MCP广场页面，包含完整的多语言支持和SEO优化。

## ✨ 功能特性

### 📱 核心功能
- ✅ **双页面路由**
  - `/mcp` - MCP广场主页
  - `/agent` - Agent专区（Coming Soon）

- ✅ **多语言支持** (新增!)
  - 🇨🇳 中文
  - 🇬🇧 English
  - 语言切换自动保存到localStorage
  - 所有UI文本和服务描述都支持双语

- ✅ **真实数据集成**
  - 从ModelScope API获取真实MCP服务数据
  - 81个分类
  - 5500+个MCP服务
  - 自动数据刷新脚本

- ✅ **完整的UI组件**
  - 固定顶部导航栏
  - 三个推广横幅卡片
  - 左侧分类侧边栏（81个分类）
  - 右侧服务卡片网格
  - 服务筛选（Hosted/Local/全部）
  - 分页加载

- ✅ **SEO优化**
  - 完整的meta标签
  - Open Graph支持
  - Twitter Card支持
  - JSON-LD结构化数据
  - Canonical URL

- ✅ **响应式设计**
  - 移动端适配
  - 平板适配
  - 桌面端优化

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
npm start
```

## 📊 数据管理

### 获取最新MCP数据

```bash
python3 scripts/fetch_all_pages.py
```

**注意**: 需要更新Cookie（从浏览器获取）

### 数据文件位置

- `src/data/mcp-data.json` - 主数据文件
  - `categories` - 81个分类及数量
  - `servers` - MCP服务列表
  - `totalCount` - 总服务数
  - `fetchedCount` - 已获取数量

### Cookie更新方法

1. 访问 https://modelscope.cn/mcp
2. 打开浏览器开发者工具 (F12)
3. 切换到 Network 标签
4. 刷新页面，找到 `mcpServers` 请求
5. 复制请求头中的 `Cookie` 值
6. 更新 `scripts/fetch_all_pages.py` 中的 `COOKIE` 变量

## 🌍 多语言使用

### 语言切换

点击页面右上角的语言下拉菜单，选择"中文"或"English"。

### 添加新语言

1. 编辑 `src/lib/i18n.ts`
2. 添加新语言到 `translations` 对象
3. 更新所有组件引用

### 当前支持的文本

- 导航栏
- 分类侧边栏
- 服务筛选
- 服务卡片
- Coming Soon页面
- 所有按钮和提示文本

## 📁 项目结构

```
ainstr/
├── src/
│   ├── app/                    # Next.js 页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页（重定向到/mcp）
│   │   ├── mcp/               # MCP广场页面
│   │   └── agent/             # Agent专区页面
│   ├── components/            # React组件
│   │   ├── Header.tsx         # 顶部导航
│   │   ├── PromotionalBanners.tsx  # 推广横幅
│   │   ├── ServiceCategories.tsx   # 分类侧边栏
│   │   ├── ServiceGrid.tsx    # 服务网格
│   │   ├── ServiceCard.tsx    # 服务卡片
│   │   └── Providers.tsx      # Context Providers
│   ├── contexts/              # React Context
│   │   └── LanguageContext.tsx  # 语言上下文
│   ├── lib/                   # 工具函数
│   │   └── i18n.ts           # 国际化配置
│   ├── data/                  # 数据文件
│   │   └── mcp-data.json     # MCP服务数据
│   └── globals.css           # 全局样式
├── scripts/                   # 数据获取脚本
│   └── fetch_all_pages.py    # 获取所有MCP数据
├── public/                    # 静态资源
└── package.json              # 项目配置
```

## 🎨 技术栈

- **框架**: Next.js 14 (App Router)
- **UI库**: Ant Design 5
- **样式**: Tailwind CSS + Custom CSS
- **语言**: TypeScript
- **状态管理**: React Context API
- **数据获取**: Python + curl

## 📝 组件说明

### Header
- 固定在顶部
- 包含Logo、导航菜单、语言切换、通知、用户菜单
- 支持移动端响应式

### ServiceCategories
- 左侧固定侧边栏
- 显示81个分类及对应服务数量
- 支持搜索筛选
- 分类名称中英文映射

### ServiceGrid
- 右侧服务卡片网格
- 每页12个服务
- 支持Hosted/Local筛选
- 加载更多功能
- 服务描述根据语言显示

### PromotionalBanners
- 三个推广横幅卡片
- 渐变背景
- 响应式布局

## 🔧 配置文件

### next.config.js
- 图片域名配置
- 安全头配置

### tailwind.config.js
- 自定义颜色
- 响应式断点

### tsconfig.json
- TypeScript配置
- 路径别名 (@/)

## 📈 数据统计

- **总服务数**: 5,510
- **已获取**: 300+ (持续更新中)
- **分类数**: 81
- **Top分类**:
  1. developer-tools (1,481)
  2. search (801)
  3. calendar-management (603)
  4. browser-automation (379)
  5. databases (377)

## 🐛 已知问题

1. API Cookie会过期，需要定期更新
2. 数据获取受API防护限制，建议使用延迟请求
3. 第4页之后可能遇到请求限制

## 📞 支持

如有问题，请查看：
- [Next.js 文档](https://nextjs.org/docs)
- [Ant Design 文档](https://ant.design/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 📄 许可证

MIT

---

**开发日期**: 2025年10月
**最后更新**: 支持多语言切换 + 数据获取优化
