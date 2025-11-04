#!/bin/bash

# 测试登录配置脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "🧪 登录服务配置测试"
echo "================================"
echo ""

# 检查环境变量
echo "📋 检查环境变量配置..."
echo ""

# 前端变量
if [ -f .env.local ]; then
    echo -e "${BLUE}前端环境变量 (.env.local):${NC}"
    grep "NEXT_PUBLIC_" .env.local | grep -v "^#" | while IFS= read -r line; do
        var_name=$(echo "$line" | cut -d'=' -f1)
        if [[ "$line" == *"="* && "$line" != *"=your_"* && "$line" != *"=$" ]]; then
            echo -e "  ${GREEN}✅${NC} $var_name"
        else
            echo -e "  ${YELLOW}⚠️ ${NC} $var_name (未配置)"
        fi
    done
else
    echo -e "${RED}❌ .env.local 文件不存在${NC}"
fi

echo ""

# 后端变量
if [ -f .dev.vars ]; then
    echo -e "${BLUE}后端环境变量 (.dev.vars):${NC}"
    grep -E "^(GOOGLE_|GITHUB_|APP_URL)" .dev.vars | grep -v "^#" | while IFS= read -r line; do
        var_name=$(echo "$line" | cut -d'=' -f1)
        if [[ "$var_name" == *"SECRET" ]]; then
            # Secret 只显示是否配置，不显示值
            if [[ "$line" == *"="* && "$line" != *"=your_"* && "$line" != *"=$" ]]; then
                echo -e "  ${GREEN}✅${NC} $var_name (已配置，值已隐藏)"
            else
                echo -e "  ${YELLOW}⚠️ ${NC} $var_name (未配置)"
            fi
        else
            if [[ "$line" == *"="* && "$line" != *"=your_"* && "$line" != *"=$" ]]; then
                echo -e "  ${GREEN}✅${NC} $var_name"
            else
                echo -e "  ${YELLOW}⚠️ ${NC} $var_name (未配置)"
            fi
        fi
    done
else
    echo -e "${RED}❌ .dev.vars 文件不存在${NC}"
fi

echo ""

# 检查数据库配置
echo "📋 检查数据库配置..."
if grep -q '"database_id": ".*[^"]' wrangler.jsonc; then
    DB_ID=$(grep '"database_id"' wrangler.jsonc | sed 's/.*"database_id": "\([^"]*\)".*/\1/')
    if [ -n "$DB_ID" ] && [ "$DB_ID" != '""' ]; then
        echo -e "  ${GREEN}✅${NC} database_id 已配置: ${DB_ID:0:8}..."
    else
        echo -e "  ${RED}❌${NC} database_id 未配置"
    fi
else
    echo -e "  ${RED}❌${NC} database_id 未配置"
fi

echo ""

# 检查 OAuth 回调 URL
echo "📋 OAuth 回调 URL 检查清单..."
echo ""
echo "请确保以下回调 URL 已在 OAuth 应用中配置："
echo ""
echo -e "${BLUE}Google OAuth:${NC}"
echo "  - https://ainstr.com/auth/callback (生产环境)"
echo "  - http://localhost:3000/auth/callback (开发环境)"
echo ""
echo -e "${BLUE}GitHub OAuth:${NC}"
echo "  - https://ainstr.com/auth/callback (生产环境)"
echo "  - http://localhost:3000/auth/callback (开发环境)"
echo ""

# 检查本地开发配置
echo "📋 本地开发配置检查..."
if grep -q "NEXT_PUBLIC_API_URL=http://localhost:8788" .env.local; then
    echo -e "  ${GREEN}✅${NC} 本地开发 API URL 已配置"
else
    echo -e "  ${YELLOW}⚠️ ${NC} 本地开发建议使用: NEXT_PUBLIC_API_URL=http://localhost:8788"
    echo "     当前配置: $(grep 'NEXT_PUBLIC_API_URL=' .env.local | grep -v '^#' || echo '未配置')"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ 配置检查完成${NC}"
echo ""
echo "📝 下一步："
echo "  1. 确保 OAuth 应用的回调 URL 已正确配置"
echo "  2. 测试本地登录功能"
echo "  3. 在 Cloudflare Dashboard 配置生产环境变量"
echo ""

