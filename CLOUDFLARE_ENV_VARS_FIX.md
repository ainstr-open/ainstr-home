# Cloudflare Pages 环境变量配置解决方案

## 🔍 问题描述

在 Cloudflare Dashboard 中配置环境变量时遇到错误：
```
Variables cannot be added to a Worker that only has static assets.
```

## 💡 原因分析

Cloudflare Pages **只有在部署了 Functions 之后才能添加环境变量**。如果项目只包含静态资源，Dashboard 不会显示环境变量配置选项。

## ✅ 解决方案

### 方案 1: 使用 wrangler.jsonc 配置（推荐）

我们已经将环境变量添加到 `wrangler.jsonc` 的 `vars` 字段中。这是推荐的配置方式。

**优点：**
- ✅ 配置在代码中，版本可控
- ✅ 使用 wrangler CLI 部署时自动应用
- ✅ 支持本地开发和生产环境

**配置位置：** `wrangler.jsonc`

```jsonc
{
  "vars": {
    "APP_URL": "https://ainstr.com",
    "GOOGLE_CLIENT_ID": "...",
    "GOOGLE_CLIENT_SECRET": "...",
    "GITHUB_CLIENT_ID": "...",
    "GITHUB_CLIENT_SECRET": "..."
  }
}
```

⚠️ **注意安全**：由于这些是敏感信息，建议：
1. 使用 Git LFS 或加密存储
2. 或者在部署时使用 CLI 传递（见方案 2）
3. 或者使用 Cloudflare Secrets（见方案 3）

### 方案 2: 使用 Wrangler CLI 部署时传递环境变量

如果使用 `wrangler pages deploy` 命令部署：

```bash
npx wrangler pages deploy out \
  --project-name=ainstr-mcp-square \
  --var GOOGLE_CLIENT_ID=871776274292-ntk0bf929u6nf8u2g9vg61cjpiq3cd2b.apps.googleusercontent.com \
  --var GOOGLE_CLIENT_SECRET=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 \
  --var GITHUB_CLIENT_ID=Ov23liOAv8SvBZyYQfNl \
  --var GITHUB_CLIENT_SECRET=46211bc3292693c0e1f48e9614f3eed74893a287 \
  --var APP_URL=https://ainstr.com
```

### 方案 3: 使用 Cloudflare Secrets（最安全，推荐用于生产）

对于敏感信息（如 Client Secret），使用 Secrets 更安全：

```bash
# 设置 Secrets（不会在日志中显示）
npx wrangler secret put GOOGLE_CLIENT_SECRET
# 提示输入时，粘贴你的 Secret

npx wrangler secret put GITHUB_CLIENT_SECRET

# 查看 Secrets 列表（只显示名称，不显示值）
npx wrangler secret list
```

**注意：** Secrets 只在 Worker 运行时可用，不能在 `wrangler.jsonc` 的 `vars` 中引用。

### 方案 4: 确保 Functions 已部署

如果你希望使用 Dashboard 配置环境变量，需要确保 Functions 已被部署：

1. **检查 Functions 目录是否存在**
   ```bash
   ls -la functions/
   ```

2. **确保构建包含 Functions**
   - Functions 目录应该在项目根目录
   - 部署时 Cloudflare 会自动检测并部署 Functions

3. **手动触发部署**
   - 在 Cloudflare Dashboard 中，进入你的 Pages 项目
   - 点击 "Retry deployment" 或重新推送代码

4. **部署后，Functions 应该可用**
   - 访问 `https://ainstr.com/api/auth/google/callback` 应该能访问到 Function
   - 然后在 Dashboard 中就可以添加环境变量了

## 🚀 推荐的配置流程

### 步骤 1: 使用 wrangler.jsonc（开发环境）

当前配置已添加环境变量到 `wrangler.jsonc`。

### 步骤 2: 部署后使用 Secrets（生产环境，更安全）

```bash
# 部署项目
git push origin main

# 或使用 wrangler 部署
npx wrangler pages deploy out --project-name=ainstr-mcp-square

# 然后设置 Secrets（敏感信息）
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_SECRET
```

### 步骤 3: 验证配置

```bash
# 测试本地开发（使用 .dev.vars）
npx wrangler pages dev out --local --d1=DB=ainstr-db

# 检查环境变量
npx wrangler pages deploy out --dry-run --project-name=ainstr-mcp-square
```

## 📝 当前配置状态

✅ **已完成：**
- `wrangler.jsonc` 中已添加环境变量
- Functions 代码已准备好
- 数据库已配置

⚠️ **注意事项：**
1. 敏感信息（Client Secret）建议使用 Secrets 而不是 vars
2. 确保 Functions 目录在部署时被包含
3. 使用 Git 部署时，确保 `wrangler.jsonc` 被包含

## 🔒 安全建议

1. **不要将 Secret 提交到 Git**
   - 使用 `.gitignore` 排除敏感文件
   - 使用 Secrets 管理敏感信息

2. **使用不同的配置用于开发和生产**
   - 开发环境：使用 `.dev.vars`
   - 生产环境：使用 Secrets 或环境变量

3. **定期轮换 Secret**
   - 如果 Secret 泄露，立即在 OAuth 提供商处重新生成

## 🐛 故障排除

### 问题 1: Dashboard 仍然无法添加环境变量

**解决：**
1. 确保 Functions 目录存在且包含 `.ts` 文件
2. 重新部署项目
3. 检查 Functions 是否已部署：访问 `/api/auth/google/callback`

### 问题 2: 环境变量在生产环境不生效

**解决：**
1. 检查 `wrangler.jsonc` 是否被包含在部署中
2. 使用 Secrets 而不是 vars（对敏感信息）
3. 使用 `wrangler pages deploy` 时传递 `--var` 参数

### 问题 3: 本地开发环境变量不生效

**解决：**
1. 确保 `.dev.vars` 文件存在
2. 使用 `--local` 标志启动开发服务器
3. 检查 `.dev.vars` 文件格式是否正确

## 📚 参考资源

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

