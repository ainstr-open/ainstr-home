# 快速启动指南

## 🎉 恭喜！项目已完成

您的ModelScope MCP广场克隆版已经准备就绪，包含以下功能：

✅ 完整的UI界面
✅ 真实的MCP数据（300条服务，81个分类）
✅ 中英文双语支持
✅ SEO优化
✅ 响应式设计

## 🚀 立即开始

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 访问页面

打开浏览器访问：

- **MCP广场**: http://localhost:3000/mcp
- **Agent专区**: http://localhost:3000/agent

### 3. 体验多语言功能

1. 点击右上角的语言下拉菜单
2. 切换"中文" ↔️ "English"
3. 观察页面文本即时更新

## 📊 当前数据状态

```
✅ MCP服务: 300条
✅ 分类: 81个
✅ 总服务数: 5,510条
✅ 数据源: ModelScope API
```

## 🌍 多语言功能

### 支持的语言
- 🇨🇳 中文 (默认)
- 🇬🇧 English

### 切换方式
页面右上角 → 语言下拉菜单 → 选择语言

### 自动保存
语言设置会自动保存到浏览器localStorage

## 🔄 更新数据

### Cookie已过期？

如果需要获取更多数据，更新Cookie后运行：

```bash
python3 scripts/fetch_all_pages.py
```

**如何获取Cookie**:
1. 访问 https://modelscope.cn/mcp
2. F12 打开开发者工具
3. Network标签 → 找到 `mcpServers` 请求
4. 复制Cookie值
5. 更新 `scripts/fetch_all_pages.py` 中的 `COOKIE` 变量

## 📁 核心文件

### 页面
- `src/app/mcp/page.tsx` - MCP广场
- `src/app/agent/page.tsx` - Agent专区

### 组件
- `src/components/Header.tsx` - 顶部导航
- `src/components/ServiceGrid.tsx` - 服务网格
- `src/components/ServiceCategories.tsx` - 分类侧边栏

### 数据和配置
- `src/data/mcp-data.json` - MCP服务数据
- `src/lib/i18n.ts` - 国际化配置
- `src/contexts/LanguageContext.tsx` - 语言上下文

## 🎨 自定义

### 修改颜色

编辑 `src/app/globals.css`:

```css
:root {
  --primary-color: #667eea;  /* 主色 */
  --secondary-color: #764ba2; /* 次色 */
}
```

### 添加新语言

编辑 `src/lib/i18n.ts`:

```typescript
export type Language = 'zh' | 'en' | 'ja'  // 添加语言代码

export const translations = {
  // ... 添加翻译
}
```

### 修改分类名称

编辑 `src/components/ServiceGrid.tsx`:

```typescript
const categoryNameMap: Record<string, string> = {
  'developer-tools': '开发者工具',
  // ... 添加映射
}
```

## 📦 生产部署

### 构建

```bash
npm run build
```

### 启动

```bash
npm start
```

### 部署到Vercel

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 🐛 故障排除

### 问题1: 页面显示空白

**解决**:
```bash
# 检查数据文件
cat src/data/mcp-data.json | python3 -m json.tool | head -20

# 如果为空，重新获取
python3 scripts/fetch_all_pages.py
```

### 问题2: 语言切换不工作

**解决**:
1. 检查浏览器控制台错误
2. 清除localStorage
3. 刷新页面

### 问题3: npm run dev失败

**解决**:
```bash
# 删除node_modules和lock文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 📚 文档

- **README.md** - 项目概述和技术栈
- **USAGE.md** - 详细使用指南
- **FEATURES.md** - 完整功能清单
- **QUICKSTART.md** - 本文件

## 🎯 下一步

### 推荐功能
1. **搜索功能** - 添加服务搜索
2. **分类筛选** - 点击分类筛选服务
3. **服务详情** - 创建详情页面
4. **暗黑模式** - 支持深色主题

### 学习资源
- [Next.js文档](https://nextjs.org/docs)
- [Ant Design](https://ant.design/)
- [React Context](https://react.dev/reference/react/useContext)

## ✅ 功能检查清单

- [x] 双页面路由 (`/mcp`, `/agent`)
- [x] 多语言切换 (中文/English)
- [x] 真实数据集成 (300条服务)
- [x] 分类侧边栏 (81个分类)
- [x] 服务网格和卡片
- [x] 服务筛选 (Hosted/Local)
- [x] 分页加载
- [x] SEO优化
- [x] 响应式设计
- [x] 数据获取脚本

## 🎉 完成！

您现在拥有一个功能完整的ModelScope MCP广场克隆版！

**享受开发吧！** 🚀

---

**创建日期**: 2025-10-18
**版本**: v1.1.0
**状态**: ✅ 生产就绪
