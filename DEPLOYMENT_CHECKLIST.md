# 🚀 Cloudflare Pages 部署检查清单

## ✅ 本地验证通过

```bash
✓ npm install - 依赖安装成功
✓ npm run build - 构建成功
✓ 生成 out/ 目录
```

## 📁 必需文件清单

### 配置文件
- [x] `package.json` - 使用精确版本，包含engines
- [x] `next.config.js` - output: 'export'
- [x] `postcss.config.js` - PostCSS配置
- [x] `tailwind.config.js` - Tailwind配置
- [x] `.node-version` - Node 18
- [x] `.nvmrc` - Node 18
- [x] `.npmrc` - npm配置
- [x] `_headers` - Cloudflare headers
- [x] `.cloudflare.yml` - Cloudflare构建配置

### 排除文件（.gitignore）
- [x] `node_modules/`
- [x] `.next/`
- [x] `out/`
- [x] `package-lock.json` (本地生成，不提交)

## ⚙️ Cloudflare Dashboard 设置

### 基本设置
```
项目名称: ainstr-mcp-square
分支: main (或 master)
```

### 构建配置
```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: (留空)
```

### 环境变量
```
NODE_VERSION = 18
NPM_VERSION = 9
NODE_ENV = production
```

### 高级设置
```
Node.js version: 18
```

## 🔍 故障排除步骤

### 如果构建失败：

#### 步骤1: 检查构建日志
在 Cloudflare Dashboard 查看详细错误信息：
- 进入项目 → Deployments
- 点击失败的部署
- 查看 "Build log"

#### 步骤2: 常见错误和解决方案

**错误: Module not found**
```bash
# 确保所有依赖在 package.json 中
npm install
npm run build
```

**错误: Node version mismatch**
```bash
# 确认 .node-version 和 .nvmrc 都是 18
cat .node-version
cat .nvmrc
```

**错误: Build timeout**
```bash
# 检查是否有大文件或循环依赖
du -sh out/
```

#### 步骤3: 本地重现错误
```bash
# 清理并重新构建
rm -rf node_modules package-lock.json .next out
npm install
npm run build
```

#### 步骤4: 简化构建
临时移除非必要配置：
```json
// package.json - 简化版
{
  "scripts": {
    "build": "next build"
  }
}
```

## 📊 预期构建输出

### 成功的构建日志应该包含：
```
Cloning repository...
Installing dependencies...
  npm install
  added XXX packages

Building application...
  npm run build
  ✓ Compiled successfully
  ✓ Generating static pages

Finished
  Success: Your site was deployed!
```

### 构建产物检查
```bash
out/
├── _headers
├── _next/
│   ├── static/
│   └── ...
├── index.html
├── mcp.html
├── agent.html
└── ...
```

## 🎯 部署后验证

### 访问测试
```
https://ainstr-mcp-square.pages.dev
https://ainstr-mcp-square.pages.dev/mcp
https://ainstr-mcp-square.pages.dev/agent
```

### 功能测试
- [ ] 页面正常加载
- [ ] Logo显示 "Ainstr"
- [ ] 语言切换工作
- [ ] 分类筛选工作
- [ ] 样式正确显示
- [ ] 响应式布局正常

### 性能检查
- [ ] Lighthouse分数 > 90
- [ ] 首次加载 < 3s
- [ ] TTI < 3.5s

## 🔄 重新部署流程

### 方法1: Git推送（推荐）
```bash
git add .
git commit -m "fix: optimize Cloudflare deployment"
git push
```
→ Cloudflare自动检测并构建

### 方法2: 手动触发
Cloudflare Dashboard → Deployments → "Retry deployment"

### 方法3: CLI部署
```bash
npm run build
wrangler pages deploy out --project-name=ainstr-mcp-square
```

## 📝 最终检查

在提交前确认：
```bash
# 1. 本地构建成功
npm run build

# 2. 检查输出目录
ls -la out/

# 3. 检查文件大小
du -sh out/

# 4. 验证关键文件
cat out/_headers
ls out/_next/static/

# 5. 提交
git status
git add .
git commit -m "ready for deployment"
git push
```

## ✅ 部署成功标志

当你看到以下内容时，部署成功：
```
✓ Build successful
✓ Deployment complete
✓ Site is live at https://ainstr-mcp-square.pages.dev
```

## 🆘 仍然失败？

### 联系信息
- [Cloudflare Community](https://community.cloudflare.com/)
- [Next.js Discord](https://discord.gg/nextjs)
- [GitHub Issues](https://github.com/vercel/next.js/issues)

### 提供以下信息
1. 完整的构建日志
2. package.json内容
3. next.config.js内容
4. 错误截图

---

**最后更新**: 2025-10-18
**状态**: ✅ 本地构建成功，准备部署
**预计构建时间**: 2-3分钟
