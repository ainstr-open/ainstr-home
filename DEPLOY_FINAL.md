# 🚀 Cloudflare Pages 部署 - 最终方案

## ⚠️ 关键要点

**Cloudflare Pages 不需要任何 wrangler 配置文件！**

- ❌ 不需要 `wrangler.toml`
- ❌ 不需要 `wrangler.json`
- ❌ 不需要 `.cloudflare.yml`
- ✅ 只需要通过 Cloudflare Dashboard 配置

## ✅ 正确的部署方式

### 唯一推荐方式：Git自动部署

#### 1. 在 Cloudflare Dashboard 创建项目

登录 https://dash.cloudflare.com/

1. 点击 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**
5. 选择你的GitHub/GitLab仓库
6. 授权Cloudflare访问

#### 2. 配置构建设置（重要！）

**基本设置**:
```
Project name: ainstr-mcp-square
Production branch: main
```

**Build settings** (点击 Framework preset 下拉选择 Next.js):
```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: (留空)
```

**Environment variables** (点击 Add variable):
```
变量名: NODE_VERSION
值: 20

变量名: NODE_ENV
值: production
```

#### 3. 保存并部署

点击 **Save and Deploy**

Cloudflare会自动：
1. 克隆仓库
2. 安装依赖 (`npm install`)
3. 运行构建 (`npm run build`)
4. 部署到全球CDN

## 📁 你的项目只需要这些文件

### 必需文件
```
✅ package.json       - 依赖和脚本
✅ next.config.js     - Next.js配置
✅ postcss.config.js  - PostCSS配置
✅ tailwind.config.js - Tailwind配置
✅ .node-version      - Node 20
✅ .nvmrc            - Node 20
✅ .npmrc            - npm配置
✅ _headers          - HTTP headers（可选）
```

### 不需要的文件（已删除或不使用）
```
❌ wrangler.toml
❌ wrangler.json
❌ .cloudflare.yml
❌ vercel.json
```

## 🔄 重新部署流程

### 方式1: 推送代码（自动）
```bash
git add .
git commit -m "deploy to Cloudflare Pages"
git push
```

每次推送到主分支，Cloudflare自动重新部署。

### 方式2: 手动触发
1. Cloudflare Dashboard
2. 进入你的项目
3. **Deployments** 标签
4. 点击 **Retry deployment**

### 方式3: 创建新部署
1. **Deployments** → **Create deployment**
2. 选择分支
3. 点击 **Save and Deploy**

## 📊 期望的构建输出

成功的构建日志：
```
22:30:00  Initializing build environment
22:30:05  Installing dependencies (npm install)
22:30:30  Running build command (npm run build)
22:30:35    ✓ Compiled successfully
22:30:45    ✓ Generating static pages (6/6)
22:31:00  Deploying to Cloudflare network
22:31:15  ✓ Deployment complete!
```

你应该看到：
```
✓ Success! Uploaded X files
✓ Deployment complete
✓ https://ainstr-mcp-square.pages.dev
```

## 🎯 当前配置摘要

### package.json
```json
{
  "scripts": {
    "build": "next build && cp _headers out/_headers"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### next.config.js
```javascript
{
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true
}
```

### Cloudflare Settings
```
Build command: npm run build
Output dir: out
Node version: 20
```

## 🐛 如果还是失败

### 检查Cloudflare构建日志
1. Dashboard → 你的项目
2. Deployments → 点击失败的部署
3. 查看完整日志

### 常见问题

**问题**: Module not found
```
# 确保package.json包含所有依赖
npm install
npm run build  # 本地测试
```

**问题**: Build timeout
```
# 可能是依赖太多，在Dashboard中增加构建超时时间
Settings → Build & deployments → Build timeout
```

**问题**: Out of memory
```
# 减小数据文件大小
# 或在Cloudflare Pro计划中增加内存
```

## ✅ 最终步骤

现在只需要：

1. **确认文件已提交**:
```bash
git status
```

2. **推送到仓库**:
```bash
git push
```

3. **在Cloudflare Dashboard监控部署**:
   - 进入 Workers & Pages
   - 选择 ainstr-mcp-square
   - 查看 Deployments 标签

4. **等待构建完成** (约2-3分钟)

5. **访问你的网站**:
```
https://ainstr-mcp-square.pages.dev
```

---

**配置类型**: Cloudflare Pages (Git-based)
**部署方式**: 自动（Git推送触发）
**Node版本**: 20
**状态**: ✅ 准备就绪
