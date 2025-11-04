# 🔌 端口架构说明

## 📋 为什么有两个端口？

### 架构概述

```
┌─────────────────────────────────────────┐
│         用户浏览器                        │
│    (访问 http://localhost:3000)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   端口 3000: Next.js 开发服务器          │
│   - 提供前端页面 (React)                 │
│   - 静态资源                              │
│   - UI 组件                               │
└──────────────┬──────────────────────────┘
               │
               │ API 请求 (通过 NEXT_PUBLIC_API_URL)
               ▼
┌─────────────────────────────────────────┐
│   端口 8788: Cloudflare Pages Functions │
│   - 后端 API (/api/auth/...)            │
│   - OAuth 回调处理                       │
│   - 数据库操作                           │
│   - 用户认证逻辑                         │
└─────────────────────────────────────────┘
```

## 🔵 端口 3000 - Next.js 前端

**作用：**
- 提供用户界面（前端页面）
- 运行 React 组件
- 处理用户交互
- 静态资源服务

**访问方式：**
- 浏览器直接访问：`http://localhost:3000`

**启动命令：**
```bash
npm run dev
```

## 🟢 端口 8788 - Cloudflare Functions 后端

**作用：**
- 处理 OAuth 登录回调
- 调用 Google/GitHub API
- 数据库操作（D1）
- 用户会话管理
- API 端点服务

**访问方式：**
- 通过前端代码调用：`${NEXT_PUBLIC_API_URL}/api/auth/...`
- 本地开发时：`http://localhost:8788`

**启动命令：**
```bash
npx wrangler pages dev out --local --d1=DB=ainstr-db
```

## 🔗 它们如何协作？

### 1. 用户访问页面
```
浏览器 → http://localhost:3000 (Next.js)
         ↓
    显示登录按钮
```

### 2. 用户点击登录
```
前端代码 (端口 3000)
    ↓
读取 NEXT_PUBLIC_API_URL
    ↓
调用 API (端口 8788)
```

### 3. OAuth 流程
```
用户点击 Google 登录
    ↓
跳转到 Google 授权页面
    ↓
Google 重定向回 http://localhost:3000/auth/callback
    ↓
前端调用 http://localhost:8788/api/auth/google/callback
    ↓
后端处理并返回用户信息
```

## 📝 环境变量配置

### 本地开发

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8788
```

**解释：**
- 前端（3000）通过这个 URL 访问后端（8788）
- 前端代码中的 API 调用会发送到 8788 端口

### 生产环境

`.env.local` (生产环境部署时):
```env
NEXT_PUBLIC_API_URL=https://ainstr.com
```

**解释：**
- 生产环境中，前端和后端在同一个域名下
- Cloudflare Pages 会自动路由 `/api/*` 到 Functions
- 不需要两个端口，都在 `https://ainstr.com` 下

## 🎯 为什么本地需要两个端口？

### Next.js 静态导出限制

由于项目使用 `output: 'export'`（静态导出），Next.js **不能运行服务器端代码**：
- ❌ 不能使用 Next.js API Routes (`/api/*`)
- ❌ 不能使用服务器端中间件
- ✅ 只能提供静态 HTML/CSS/JS

### 解决方案

使用 **Cloudflare Pages Functions** 作为后端：
- ✅ 处理 OAuth 回调
- ✅ 数据库操作
- ✅ API 端点

## 🚀 本地开发流程

### 启动两个服务

**终端 1 - 前端：**
```bash
npm run dev
# 启动在 http://localhost:3000
```

**终端 2 - 后端：**
```bash
npx wrangler pages dev out --local --d1=DB=ainstr-db
# 启动在 http://localhost:8788
```

### 使用测试脚本（自动启动）

```bash
./scripts/test-login.sh
```

脚本会自动：
1. 检查并启动 Next.js（如果需要）
2. 检查并启动 Functions（如果需要）
3. 验证服务状态

## 🌐 生产环境

在生产环境中，只有一个域名：

```
https://ainstr.com          → 前端页面
https://ainstr.com/api/*    → Cloudflare Functions
```

Cloudflare Pages 自动处理路由，不需要两个端口。

## ❓ 常见问题

### Q: 能不能只用一个端口？

**A:** 本地开发时不行，因为：
1. Next.js 静态导出不支持 API Routes
2. Cloudflare Functions 需要单独运行

**但生产环境只有一个域名！**

### Q: 为什么前端要调用 8788？

**A:** 因为 `.env.local` 中设置了 `NEXT_PUBLIC_API_URL=http://localhost:8788`

前端代码会使用这个变量：
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin
fetch(`${apiUrl}/api/auth/google/callback`)
```

### Q: 生产环境也是这样吗？

**A:** 不是！生产环境中：
- `NEXT_PUBLIC_API_URL=https://ainstr.com`
- 前端和后端都在同一个域名
- Cloudflare 自动路由 `/api/*` 到 Functions

## ✅ 总结

| 环境 | 前端端口 | 后端端口 | 访问方式 |
|------|---------|---------|---------|
| **本地开发** | 3000 | 8788 | 两个独立的服务器 |
| **生产环境** | - | - | 同一个域名 (ainstr.com) |

本地开发需要两个端口是因为技术架构限制，生产环境会自动合并到一个域名下。

