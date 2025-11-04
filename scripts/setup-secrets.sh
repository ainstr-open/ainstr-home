#!/bin/bash

# Cloudflare Secrets 配置脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "🔐 Cloudflare Secrets 配置脚本"
echo "================================"
echo ""
echo "此脚本将帮助您设置 Cloudflare Secrets 来安全地管理敏感信息。"
echo ""
echo -e "${YELLOW}注意：Secrets 只用于生产环境，不会显示在代码或日志中。${NC}"
echo ""

# 检查 wrangler
if command -v wrangler &> /dev/null; then
    WRANGLER_CMD="wrangler"
elif command -v npx &> /dev/null; then
    WRANGLER_CMD="npx wrangler"
else
    echo -e "${RED}❌ 未找到 wrangler，请先安装${NC}"
    exit 1
fi

# 检查是否登录
if ! $WRANGLER_CMD whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 Cloudflare，请先登录${NC}"
    $WRANGLER_CMD login
fi

echo ""
echo "📋 将从 .dev.vars 读取 Secret 值（如果存在）"
echo ""

# 读取 .dev.vars 文件
if [ -f .dev.vars ]; then
    GOOGLE_SECRET=$(grep "^GOOGLE_CLIENT_SECRET=" .dev.vars | cut -d'=' -f2- | tr -d '"' || echo "")
    GITHUB_SECRET=$(grep "^GITHUB_CLIENT_SECRET=" .dev.vars | cut -d'=' -f2- | tr -d '"' || echo "")

    if [ -n "$GOOGLE_SECRET" ] && [ "$GOOGLE_SECRET" != "your_google_client_secret_here" ]; then
        echo -e "${GREEN}✅ 从 .dev.vars 读取到 GOOGLE_CLIENT_SECRET${NC}"
        HAS_GOOGLE_SECRET=true
    else
        HAS_GOOGLE_SECRET=false
    fi

    if [ -n "$GITHUB_SECRET" ] && [ "$GITHUB_SECRET" != "your_github_client_secret_here" ]; then
        echo -e "${GREEN}✅ 从 .dev.vars 读取到 GITHUB_CLIENT_SECRET${NC}"
        HAS_GITHUB_SECRET=true
    else
        HAS_GITHUB_SECRET=false
    fi
else
    HAS_GOOGLE_SECRET=false
    HAS_GITHUB_SECRET=false
fi

echo ""
echo "🔐 开始设置 Secrets..."
echo ""

# 设置 GOOGLE_CLIENT_SECRET
echo -e "${BLUE}1. 设置 GOOGLE_CLIENT_SECRET${NC}"
if [ "$HAS_GOOGLE_SECRET" = true ]; then
    echo -e "${YELLOW}   从 .dev.vars 读取到的值将自动使用${NC}"
    echo -e "${YELLOW}   （如果提示输入，请粘贴您的 Google Client Secret）${NC}"
    echo ""
    echo "$GOOGLE_SECRET" | $WRANGLER_CMD secret put GOOGLE_CLIENT_SECRET
else
    echo -e "${YELLOW}   请手动输入您的 Google Client Secret${NC}"
    echo ""
    $WRANGLER_CMD secret put GOOGLE_CLIENT_SECRET
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GOOGLE_CLIENT_SECRET 设置成功${NC}"
else
    echo -e "${RED}❌ GOOGLE_CLIENT_SECRET 设置失败${NC}"
fi

echo ""

# 设置 GITHUB_CLIENT_SECRET
echo -e "${BLUE}2. 设置 GITHUB_CLIENT_SECRET${NC}"
if [ "$HAS_GITHUB_SECRET" = true ]; then
    echo -e "${YELLOW}   从 .dev.vars 读取到的值将自动使用${NC}"
    echo -e "${YELLOW}   （如果提示输入，请粘贴您的 GitHub Client Secret）${NC}"
    echo ""
    echo "$GITHUB_SECRET" | $WRANGLER_CMD secret put GITHUB_CLIENT_SECRET
else
    echo -e "${YELLOW}   请手动输入您的 GitHub Client Secret${NC}"
    echo ""
    $WRANGLER_CMD secret put GITHUB_CLIENT_SECRET
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GITHUB_CLIENT_SECRET 设置成功${NC}"
else
    echo -e "${RED}❌ GITHUB_CLIENT_SECRET 设置失败${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Secrets 配置完成！${NC}"
echo ""
echo "📋 查看已设置的 Secrets："
echo "   $WRANGLER_CMD secret list"
echo ""
echo "📝 注意事项："
echo "   - Secrets 只在生产环境可用"
echo "   - 本地开发请继续使用 .dev.vars"
echo "   - Secrets 不会显示在代码、日志或配置文件中"
echo ""
echo "🧪 验证 Secrets："
echo "   部署后，您的 Functions 代码可以通过 env.GOOGLE_CLIENT_SECRET 访问"
echo ""

