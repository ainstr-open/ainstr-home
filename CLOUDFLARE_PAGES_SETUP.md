# Cloudflare Pages 正确配置

## ⚠️ 重要说明

**Cloudflare Pages** 和 **Cloudflare Workers** 是不同的产品：
- ❌ **不要使用** `wrangler.toml` （这是Workers配置）
- ❌ **不要运行** `wrangler pages deploy` 命令
- ✅ **使用** Git推送自动部署
- ✅ **使用** Cloudflare Dashboard配置

## ✅ 正确的部署方式

### 方法1: Git自动部署（推荐）

#### 步骤1: 连接Git仓库
1. 登录 https://dash.cloudflare.com/
2. 进入 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** → **Connect to Git**
5. 选择你的仓库（GitHub/GitLab）
6. 授权访问

#### 步骤2: 配置构建设置

```
Project name: ainstr-mcp-square
Production branch: main

Build settings:
  Framework preset: Next.js (Static HTML Export)
  Build command: npm run build
  Build output directory: out

Environment variables:
  NODE_VERSION = 20
  NPM_VERSION = 9
  NODE_ENV = production
```

#### 步骤3: 部署
点击 **Save and Deploy**

每次推送到main分支都会自动重新部署。

### 方法2: 直接上传（不推荐用于生产）

```bash
# 本地构建
npm run build

# 使用Cloudflare Dashboard上传
# 1. 进入项目
# 2. 选择 Deployments
# 3. 点击 "Upload assets"
# 4. 上传 out/ 目录
```

## 📁 项目配置文件

### package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && cp _headers out/_headers",
    "start": "next start",
    "lint": "next lint"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  }
}
```

### next.config.js
```javascript
module.exports = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}
```

### .node-version
```
20
```

### .cloudflare.yml
```yaml
build:
  command: npm run build
  destination: out
  node_version: 20
```

### _headers
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

## 🚫 不需要的文件

以下文件已删除（不适用于Pages）：
- ❌ `wrangler.toml` - Workers配置
- ❌ `@cloudflare/next-on-pages` - Workers框架

## 🔄 部署流程

### 完整部署步骤

```bash
# 1. 本地测试
npm install
npm run build

# 2. 提交代码
git add .
git commit -m "deploy: configure for Cloudflare Pages"
git push origin main

# 3. Cloudflare自动检测并构建
# 4. 查看构建进度：Dashboard → Your Project → Deployments
```

## 📊 构建日志示例

成功的构建：
```
Initializing build environment...
  Node version: 20.x.x

Cloning repository...
  Success

Installing dependencies...
  npm install
  added 153 packages

Building application...
  npm run build
  ✓ Compiled successfully
  ✓ Linting and checking validity of types
  ✓ Collecting page data
  ✓ Generating static pages (6/6)
  ✓ Finalizing page optimization

Deploying to Cloudflare's global network...
  Success!

Deployment complete!
  ✓ https://ainstr-mcp-square.pages.dev
```

## 🎯 环境变量配置

在 Cloudflare Dashboard 中设置：

**Production环境**:
```
NODE_VERSION = 20
NPM_VERSION = 9
NODE_ENV = production
```

**Preview环境（可选）**:
```
NODE_VERSION = 20
NODE_ENV = development
```

## 🌐 自定义域名

### 添加域名
1. 项目 → **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入域名（如 `mcp.ainstr.com`）
4. 添加DNS记录：
   ```
   Type: CNAME
   Name: mcp
   Target: ainstr-mcp-square.pages.dev
   ```

## 🔍 故障排除

### 错误: Workers-specific command
```
[ERROR] It looks like you've run a Workers-specific command
```

**解决**:
- 不要使用 `wrangler` 命令
- 使用 Git推送部署
- 删除 `wrangler.toml`

### 错误: Build failed
**检查**:
1. Cloudflare Dashboard → 查看构建日志
2. 确认 `NODE_VERSION = 20`
3. 确认 `Build output directory = out`
4. 本地测试 `npm run build`

### 错误: 404 Not Found
**检查**:
1. 确认 `output: 'export'` 在 next.config.js
2. 确认 out/ 目录存在
3. 确认构建成功

## ✅ 验证部署

访问以下URL测试：
```
https://ainstr-mcp-square.pages.dev
https://ainstr-mcp-square.pages.dev/mcp
https://ainstr-mcp-square.pages.dev/agent
```

## 📚 官方文档

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Next.js on Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Build Configuration](https://developers.cloudflare.com/pages/platform/build-configuration/)

---

**更新**: 2025-10-18
**Node版本**: 20
**部署方式**: Git自动部署
**状态**: ✅ 配置完成
