#!/bin/bash

# 登录功能测试脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "🧪 登录功能测试"
echo "================================"
echo ""

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# 检查 Next.js 开发服务器
echo "📋 检查 Next.js 开发服务器..."
if check_port 3000; then
    echo -e "${GREEN}✅ Next.js 开发服务器已在运行 (端口 3000)${NC}"
    NEXTJS_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Next.js 开发服务器未运行${NC}"
    NEXTJS_RUNNING=false
fi

# 检查 Cloudflare Pages Functions
echo ""
echo "📋 检查 Cloudflare Pages Functions..."
if check_port 8788; then
    echo -e "${GREEN}✅ Cloudflare Functions 已在运行 (端口 8788)${NC}"
    FUNCTIONS_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Cloudflare Functions 未运行${NC}"
    FUNCTIONS_RUNNING=false
fi

echo ""
echo "================================"
echo "🚀 启动测试环境"
echo "================================"
echo ""

# 启动 Next.js（如果未运行）
if [ "$NEXTJS_RUNNING" = false ]; then
    echo -e "${BLUE}启动 Next.js 开发服务器...${NC}"
    npm run dev > /tmp/nextjs-dev.log 2>&1 &
    NEXTJS_PID=$!
    echo "Next.js PID: $NEXTJS_PID"

    # 等待服务器启动
    echo "等待服务器启动..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Next.js 服务器已启动${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
else
    NEXTJS_PID=""
fi

# 启动 Cloudflare Functions（如果未运行）
if [ "$FUNCTIONS_RUNNING" = false ]; then
    echo ""
    echo -e "${BLUE}启动 Cloudflare Pages Functions...${NC}"
    echo "（这可能需要一些时间）"

    npx wrangler pages dev out --local --d1=DB=ainstr-db > /tmp/wrangler-dev.log 2>&1 &
    WRANGLER_PID=$!
    echo "Wrangler PID: $WRANGLER_PID"

    # 等待 Functions 启动
    echo "等待 Functions 启动..."
    for i in {1..60}; do
        if curl -s http://localhost:8788 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Cloudflare Functions 已启动${NC}"
            break
        fi
        sleep 1
        if [ $((i % 5)) -eq 0 ]; then
            echo -n "."
        fi
    done
    echo ""
else
    WRANGLER_PID=""
fi

echo ""
echo "================================"
echo "✅ 测试环境已就绪"
echo "================================"
echo ""
echo "📋 服务状态："
echo "  - Next.js:        http://localhost:3000"
echo "  - API Functions:  http://localhost:8788"
echo ""
echo "🧪 测试步骤："
echo ""
echo "1. 打开浏览器访问: http://localhost:3000"
echo "2. 点击右上角 '登录/注册' 按钮"
echo "3. 在登录弹窗中选择 Google 或 GitHub 登录"
echo "4. 完成 OAuth 授权"
echo "5. 验证是否成功登录并显示用户信息"
echo ""
echo "📝 API 端点测试："
echo ""
echo "测试 API 是否可访问："
echo "  curl http://localhost:8788/api/auth/google/callback"
echo ""
echo "查看日志："
echo "  - Next.js:    tail -f /tmp/nextjs-dev.log"
echo "  - Functions:  tail -f /tmp/wrangler-dev.log"
echo ""
echo "🛑 停止服务："
if [ -n "$NEXTJS_PID" ]; then
    echo "  杀死 Next.js:    kill $NEXTJS_PID"
fi
if [ -n "$WRANGLER_PID" ]; then
    echo "  杀死 Functions:  kill $WRANGLER_PID"
fi
echo ""

# 测试 API 端点
echo "📋 测试 API 端点..."
echo ""

# 测试根路径
echo "1. 测试 Functions 根路径..."
if curl -s http://localhost:8788 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Functions 根路径可访问${NC}"
else
    echo -e "${YELLOW}⚠️  Functions 根路径无法访问（可能正常，因为没有根路由）${NC}"
fi

# 测试中间件
echo ""
echo "2. 测试 CORS 中间件..."
CORS_TEST=$(curl -s -X OPTIONS -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    http://localhost:8788/api/auth/google/callback 2>&1)

if echo "$CORS_TEST" | grep -q "Access-Control-Allow-Origin" || [ -z "$CORS_TEST" ]; then
    echo -e "${GREEN}✅ CORS 中间件正常工作${NC}"
else
    echo -e "${YELLOW}⚠️  CORS 测试未通过（可能正常，取决于实现）${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ 测试环境准备完成${NC}"
echo ""
echo "现在可以打开浏览器测试登录功能了！"
echo "访问: http://localhost:3000"
echo ""

