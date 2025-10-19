# 🚀 快速修复 Cloudflare 部署错误

## ❌ 错误信息
```
Failed: error occurred while installing tools or dependencies
```

## ✅ 5步快速修复

### 1️⃣ 确认文件已更新
检查以下文件是否存在且正确：

```bash
✅ package.json - 使用精确版本号
✅ postcss.config.js - 新创建
✅ .node-version - 内容: 18
✅ .nvmrc - 内容: 18
```

### 2️⃣ 本地测试构建

```bash
# 清理环境
rm -rf node_modules package-lock.json .next out

# 重新安装
npm install

# 测试构建
npm run build
```

如果本地构建成功，继续下一步。

### 3️⃣ 提交并推送代码

```bash
git add .
git commit -m "fix: update dependencies and add missing config files"
git push
```

### 4️⃣ Cloudflare Dashboard 配置

登录 https://dash.cloudflare.com/ 并配置：

**构建设置**:
```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: (留空)
```

**环境变量**:
```
NODE_VERSION = 18
```

### 5️⃣ 重新部署

- Cloudflare 会自动检测推送并重新构建
- 或在 Dashboard 中点击 "Retry deployment"

## 📊 验证构建成功

构建成功的标志：
```
✓ Collecting page data
✓ Generating static pages (3/3)
✓ Finalizing page optimization

Route (app)                Size     First Load JS
┌ ○ /                      ...      ...
├ ○ /mcp                   ...      ...
└ ○ /agent                 ...      ...

✓ Build successful
```

## 🎯 关键文件检查

### package.json
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### next.config.js
```javascript
{
  output: 'export',
  images: { unoptimized: true }
}
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## ⚡ 如果还是失败

### 选项A: 查看详细日志
Cloudflare Dashboard → 你的项目 → Deployments → 点击失败的部署 → 查看完整日志

### 选项B: 手动触发构建
```bash
# 本地构建并上传
npm run build
wrangler pages deploy out --project-name=ainstr-mcp-square
```

### 选项C: 简化构建
临时移除 package.json 中的以下配置来测试：
```json
"pages:build": "npx @cloudflare/next-on-pages",
```

改为标准构建：
```json
"build": "next build"
```

## 📞 需要帮助？

1. 检查 DEPLOYMENT_TROUBLESHOOTING.md 详细指南
2. 查看 Cloudflare 构建日志
3. 访问 Cloudflare Community

---

**更新时间**: 2025-10-18
**状态**: ✅ 配置已优化
