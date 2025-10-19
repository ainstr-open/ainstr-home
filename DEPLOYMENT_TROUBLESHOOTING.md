# Cloudflare Pages 部署故障排除

## ❌ 错误：Failed: error occurred while installing tools or dependencies

### 原因分析
这个错误通常由以下原因引起：
1. Node版本不兼容
2. 依赖版本冲突
3. 缺少必要的配置文件
4. package-lock.json 冲突

### ✅ 解决方案

#### 步骤1: 更新 package.json

确保使用精确的版本号（已修复）：
```json
{
  "dependencies": {
    "next": "14.2.33",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "antd": "5.21.2",
    "@ant-design/icons": "5.5.1"
  },
  "devDependencies": {
    "@types/node": "20.16.5",
    "@types/react": "18.3.5",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.20",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.33",
    "postcss": "8.4.47",
    "tailwindcss": "3.4.13",
    "typescript": "5.6.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

#### 步骤2: 添加必要的配置文件

**postcss.config.js** (已创建):
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Node版本文件** (已创建):
- `.node-version` → 18
- `.nvmrc` → 18

#### 步骤3: 清理并重新安装

在本地测试：
```bash
# 删除旧文件
rm -rf node_modules package-lock.json .next

# 重新安装
npm install

# 测试构建
npm run build
```

#### 步骤4: Cloudflare Dashboard 配置

登录 Cloudflare Dashboard，配置构建设置：

**环境变量**:
```
NODE_VERSION=18
NPM_VERSION=9
```

**构建配置**:
```
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Root directory: (留空)
```

**高级选项**:
```
Node.js version: 18
```

### 🔧 Cloudflare 特定配置

#### 选项1: 使用标准 Next.js 构建（推荐）

在 Cloudflare Dashboard 中：
1. **Framework preset**: Next.js (Static HTML Export)
2. **Build command**: `npm run build`
3. **Build output**: `out`
4. **Node version**: 18

#### 选项2: 使用 @cloudflare/next-on-pages

如果要使用 Edge Runtime：

1. 安装依赖：
```bash
npm install --save-dev @cloudflare/next-on-pages@1
```

2. 更新构建命令：
```bash
npx @cloudflare/next-on-pages
```

3. 输出目录：
```
.vercel/output/static
```

### 📋 检查清单

部署前确认：

- [ ] ✅ Node版本：18 (.node-version, .nvmrc)
- [ ] ✅ package.json：精确版本号
- [ ] ✅ postcss.config.js：存在
- [ ] ✅ tailwind.config.js：存在
- [ ] ✅ next.config.js：output = 'export'
- [ ] ✅ 本地构建成功：npm run build
- [ ] ✅ 无 node_modules 提交
- [ ] ✅ 删除 package-lock.json（让Cloudflare生成新的）

### 🐛 常见错误和解决方案

#### 错误1: Module not found
```
Error: Cannot find module 'tailwindcss'
```

**解决**:
```bash
npm install -D tailwindcss postcss autoprefixer
```

#### 错误2: Next.js 版本不兼容
```
Error: The engine "node" is incompatible
```

**解决**:
在 Cloudflare Dashboard 设置：
```
NODE_VERSION=18
```

#### 错误3: TypeScript 编译错误
```
Type error: ...
```

**解决**:
```bash
# 检查类型错误
npm run lint

# 修复后重新构建
npm run build
```

#### 错误4: 静态导出失败
```
Error: Page "/api/...") is incompatible with `output: export`
```

**解决**:
确保 next.config.js：
```javascript
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  }
}
```

### 🔄 重新部署步骤

1. **清理本地环境**:
```bash
rm -rf node_modules package-lock.json .next out
npm install
npm run build
```

2. **提交更新**:
```bash
git add .
git commit -m "fix: update dependencies for Cloudflare Pages"
git push
```

3. **Cloudflare 自动部署**:
- 推送后自动触发
- 查看构建日志

4. **手动触发（如需要）**:
- Cloudflare Dashboard → Pages
- 选择项目 → Deployments
- 点击 "Retry deployment"

### 📊 构建日志分析

如果仍然失败，查看 Cloudflare 构建日志：

**成功的构建应该显示**:
```
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    ...
├ ○ /mcp                                 ...
└ ○ /agent                               ...

✓ Build successful
```

**失败时查找**:
- npm ERR! → 依赖问题
- Module not found → 缺少包
- Type error → TypeScript错误

### 💡 最佳实践

1. **本地先测试**:
```bash
npm run build
```

2. **使用精确版本号**:
```json
"next": "14.2.33"  // ✅ 好
"next": "^14.0.0"  // ❌ 可能导致问题
```

3. **提交必要文件**:
- ✅ package.json
- ✅ next.config.js
- ✅ postcss.config.js
- ✅ tailwind.config.js
- ✅ .node-version / .nvmrc
- ❌ node_modules
- ❌ .next
- ❌ out

### 🆘 仍然失败？

尝试简化构建：

**方案A: 最小化构建**
```bash
# 暂时移除非必要依赖
npm uninstall styled-components

# 重新构建
npm run build
```

**方案B: 使用 Vercel 适配器**
```bash
npm install -D vercel
npx vercel build
```

**方案C: 联系支持**
- Cloudflare Community: https://community.cloudflare.com/
- GitHub Issues: 检查类似问题

---

**状态**: ✅ 配置已优化
**Node版本**: 18
**构建方式**: Static Export
**预计构建时间**: 2-3分钟
