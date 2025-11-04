#!/bin/bash

# 登录服务配置脚本
# 用于快速检查和配置登录相关的环境变量

set -e

echo "🚀 Ainstr 登录服务配置脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 .env.local 文件
echo "📋 检查前端环境变量文件..."
if [ -f .env.local ]; then
    echo -e "${GREEN}✅ .env.local 文件已存在${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local 文件不存在，正在创建...${NC}"
    cp .env.local.example .env.local 2>/dev/null || {
        echo "创建 .env.local 文件..."
        cat > .env.local << 'EOF'
# 前端环境变量
# 请填入实际的 OAuth Client ID

# Google OAuth Client ID（前端使用）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# GitHub OAuth Client ID（前端使用）
NEXT_PUBLIC_GITHUB_CLIENT_ID=

# API URL（前端调用后端 API 的地址）
# 生产环境
NEXT_PUBLIC_API_URL=https://ainstr.com
# 本地开发时
# NEXT_PUBLIC_API_URL=http://localhost:8788
EOF
        echo -e "${GREEN}✅ .env.local 文件已创建${NC}"
    }
fi

# 检查 .dev.vars 文件
echo ""
echo "📋 检查后端环境变量文件..."
if [ -f .dev.vars ]; then
    echo -e "${GREEN}✅ .dev.vars 文件已存在${NC}"

    # 检查是否配置了必要的变量
    if grep -q "GOOGLE_CLIENT_ID=" .dev.vars && grep -q "GOOGLE_CLIENT_ID=your_" .dev.vars; then
        echo -e "${YELLOW}⚠️  .dev.vars 中的 OAuth 配置需要更新${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .dev.vars 文件不存在，正在创建...${NC}"
    cp .dev.vars.example .dev.vars 2>/dev/null || {
        echo "创建 .dev.vars 文件..."
        cat > .dev.vars << 'EOF'
# Cloudflare Workers/Pages Functions 环境变量
# 请填入实际的 OAuth Client ID 和 Secret

# Google OAuth 配置（后端使用）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# GitHub OAuth 配置（后端使用）
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# 应用 URL
APP_URL=http://localhost:8788
EOF
        echo -e "${GREEN}✅ .dev.vars 文件已创建${NC}"
    }
fi

# 检查 wrangler.jsonc 中的 database_id
echo ""
echo "📋 检查 Cloudflare D1 数据库配置..."
if grep -q '"database_id": ""' wrangler.jsonc; then
    echo -e "${RED}❌ database_id 未配置${NC}"
    echo ""
    echo "请执行以下命令创建数据库："
    echo "  wrangler d1 create ainstr-db"
    echo ""
    echo "然后将返回的 database_id 填入 wrangler.jsonc"
else
    echo -e "${GREEN}✅ database_id 已配置${NC}"
fi

# 检查环境变量值
echo ""
echo "📋 检查环境变量值..."
echo ""

# 检查前端环境变量
if [ -f .env.local ]; then
    if grep -q "NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env.local && ! grep -q "NEXT_PUBLIC_GOOGLE_CLIENT_ID=$" .env.local && ! grep -q "NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_" .env.local; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_GOOGLE_CLIENT_ID 未配置${NC}"
    fi

    if grep -q "NEXT_PUBLIC_GITHUB_CLIENT_ID=" .env.local && ! grep -q "NEXT_PUBLIC_GITHUB_CLIENT_ID=$" .env.local && ! grep -q "NEXT_PUBLIC_GITHUB_CLIENT_ID=your_" .env.local; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_GITHUB_CLIENT_ID 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_GITHUB_CLIENT_ID 未配置${NC}"
    fi
fi

# 检查后端环境变量
if [ -f .dev.vars ]; then
    if grep -q "GOOGLE_CLIENT_SECRET=" .dev.vars && ! grep -q "GOOGLE_CLIENT_SECRET=$" .dev.vars && ! grep -q "GOOGLE_CLIENT_SECRET=your_" .dev.vars; then
        echo -e "${GREEN}✅ GOOGLE_CLIENT_SECRET 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  GOOGLE_CLIENT_SECRET 未配置${NC}"
    fi

    if grep -q "GITHUB_CLIENT_SECRET=" .dev.vars && ! grep -q "GITHUB_CLIENT_SECRET=$" .dev.vars && ! grep -q "GITHUB_CLIENT_SECRET=your_" .dev.vars; then
        echo -e "${GREEN}✅ GITHUB_CLIENT_SECRET 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  GITHUB_CLIENT_SECRET 未配置${NC}"
    fi
fi

echo ""
echo "================================"
echo "📝 下一步："
echo ""
echo "1. 配置 OAuth 应用："
echo "   - Google: https://console.cloud.google.com/"
echo "   - GitHub: https://github.com/settings/developers"
echo ""
echo "2. 编辑 .env.local 文件，填入 OAuth Client ID"
echo ""
echo "3. 编辑 .dev.vars 文件，填入 OAuth Client ID 和 Secret"
echo ""
echo "4. 创建 Cloudflare D1 数据库："
echo "   wrangler d1 create ainstr-db"
echo "   然后更新 wrangler.jsonc 中的 database_id"
echo ""
echo "5. 初始化数据库："
echo "   wrangler d1 execute ainstr-db --file=./db/schema.sql"
echo ""
echo "详细说明请查看："
echo "  - AUTH_SETUP.md"
echo "  - CLOUDFLARE_D1_SETUP.md"
echo "  - CONFIG_CHECK.md"
echo ""

