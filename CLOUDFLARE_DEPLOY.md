# Cloudflare Pages 部署指南

## 📋 准备工作

### 1. 安装依赖
```bash
npm install
```

### 2. 确保配置文件存在
- ✅ `wrangler.toml` - Cloudflare配置
- ✅ `.node-version` - Node.js版本
- ✅ `next.config.js` - Next.js静态导出配置

## 🚀 部署方式

### 方式一：通过 Cloudflare Dashboard（推荐）

#### 1. 连接Git仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 点击 **创建项目** → **连接到Git**
4. 选择你的GitHub/GitLab仓库
5. 授权Cloudflare访问仓库

#### 2. 配置构建设置

**构建配置：**
```
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Node version: 18
```

**环境变量（可选）：**
```
NODE_ENV=production
```

#### 3. 部署

- 点击 **保存并部署**
- Cloudflare会自动构建和部署
- 每次推送到主分支会自动重新部署

### 方式二：通过 Wrangler CLI

#### 1. 安装 Wrangler
```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare
```bash
wrangler login
```

#### 3. 构建项目
```bash
npm run build
```

#### 4. 部署到 Cloudflare Pages
```bash
wrangler pages deploy out --project-name=ainstr-mcp-square
```

或使用快捷命令：
```bash
npm run deploy
```

## 📁 项目结构

```
ainstr/
├── .node-version          # Node.js版本（18）
├── wrangler.toml         # Cloudflare配置
├── next.config.js        # Next.js静态导出配置
├── package.json          # 包含部署脚本
├── out/                  # 构建输出（自动生成）
└── src/                  # 源代码
```

## ⚙️ 关键配置说明

### next.config.js
```javascript
const nextConfig = {
  output: 'export',      // 静态导出模式
  images: {
    unoptimized: true,  // 禁用图片优化（Cloudflare不支持）
  },
}
```

### package.json 部署脚本
```json
{
  "scripts": {
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npm run pages:build && wrangler pages dev",
    "deploy": "npm run pages:build && wrangler pages deploy"
  }
}
```

## 🔧 自定义域名

### 1. 在 Cloudflare Pages 中添加域名

1. 进入你的 Pages 项目
2. 点击 **自定义域**
3. 添加域名（例如：mcp.yourdomain.com）
4. 按照提示配置DNS记录

### 2. DNS 配置

添加CNAME记录：
```
Type: CNAME
Name: mcp (或 @)
Target: your-project.pages.dev
```

## 🌍 环境变量配置

### 开发环境
在 `.dev.vars` 文件中配置（本地开发）：
```bash
NODE_ENV=development
```

### 生产环境
在 Cloudflare Dashboard 中配置：

1. 进入 Pages 项目
2. **设置** → **环境变量**
3. 添加变量：
   ```
   NODE_ENV=production
   ```

## 🧪 本地预览

### 预览生产构建
```bash
npm run build
npm run preview
```

访问：http://localhost:8788

## 📊 性能优化

### 1. 启用 Cloudflare CDN
- ✅ 自动启用全球CDN
- ✅ 边缘缓存
- ✅ 自动HTTPS

### 2. 构建优化
```bash
# 分析构建大小
npm run build

# 查看构建输出
ls -lh out/
```

### 3. 缓存策略

在 `wrangler.toml` 中配置：
```toml
[site]
bucket = "out"

[[route]]
pattern = "/_next/static/*"
custom_key = "$request_uri"
```

## 🐛 常见问题

### Q: 部署后页面404

**解决方案：**
1. 确认 `next.config.js` 中设置了 `output: 'export'`
2. 确认 `Build output directory` 设置为 `out`
3. 重新构建并部署

### Q: 图片无法显示

**解决方案：**
1. 确认 `images.unoptimized: true`
2. 使用相对路径或完整URL
3. 将图片放在 `public/` 目录

### Q: API路由不工作

**原因：** Cloudflare Pages (静态导出) 不支持Next.js API路由

**解决方案：**
- 使用Cloudflare Workers
- 或使用外部API服务

### Q: 样式丢失

**解决方案：**
```bash
# 清除缓存重新构建
rm -rf .next out
npm run build
```

## 📈 监控和分析

### Cloudflare Analytics
- 访问量统计
- 性能指标
- 地理分布

访问：Cloudflare Dashboard → Analytics

### Web Analytics
在 Cloudflare Pages 中启用免费的 Web Analytics：
1. **设置** → **Web Analytics**
2. 复制跟踪代码
3. 添加到 `src/app/layout.tsx`

## 🔐 安全设置

### 1. 设置访问策略（可选）
```toml
# wrangler.toml
[[rules]]
action = "block"
expression = "ip.geoip.country == 'XX'"
```

### 2. DDoS 保护
Cloudflare 自动提供DDoS保护

### 3. SSL/TLS
自动配置HTTPS证书

## 🚦 CI/CD 集成

### GitHub Actions示例

创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ainstr-mcp-square
          directory: out
```

## 📞 技术支持

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## ✅ 部署检查清单

- [ ] 安装依赖 `npm install`
- [ ] 构建成功 `npm run build`
- [ ] 本地预览正常 `npm run preview`
- [ ] 推送代码到Git仓库
- [ ] 在Cloudflare Dashboard连接仓库
- [ ] 配置构建设置
- [ ] 部署成功
- [ ] 访问测试 `https://your-project.pages.dev`
- [ ] 配置自定义域名（可选）
- [ ] 配置环境变量（可选）

---

**部署平台**: Cloudflare Pages
**框架**: Next.js 14 (Static Export)
**Node版本**: 18
**构建时间**: ~2-3分钟
**状态**: ✅ 生产就绪
