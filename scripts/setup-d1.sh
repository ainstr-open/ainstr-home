#!/bin/bash

# Cloudflare D1 数据库配置脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🚀 Cloudflare D1 数据库配置脚本"
echo "================================"
echo ""

# 检查 wrangler 是否安装
echo "📋 检查 Wrangler CLI..."
if command -v wrangler &> /dev/null || npx wrangler --version &> /dev/null; then
    echo -e "${GREEN}✅ Wrangler CLI 已安装${NC}"
    WRANGLER_CMD="wrangler"
    if ! command -v wrangler &> /dev/null; then
        WRANGLER_CMD="npx wrangler"
    fi
else
    echo -e "${YELLOW}⚠️  Wrangler CLI 未全局安装，将使用 npx${NC}"
    WRANGLER_CMD="npx wrangler"
fi

# 检查是否登录
echo ""
echo "📋 检查 Cloudflare 登录状态..."
if $WRANGLER_CMD whoami &> /dev/null; then
    USER_INFO=$($WRANGLER_CMD whoami 2>&1)
    echo -e "${GREEN}✅ 已登录 Cloudflare${NC}"
    echo "   $USER_INFO"
else
    echo -e "${YELLOW}⚠️  未登录 Cloudflare，请先登录${NC}"
    echo ""
    echo "执行以下命令登录："
    echo "  $WRANGLER_CMD login"
    echo ""
    read -p "是否现在登录？(y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $WRANGLER_CMD login
    else
        echo -e "${RED}❌ 请先登录后再运行此脚本${NC}"
        exit 1
    fi
fi

# 检查数据库是否已创建
echo ""
echo "📋 检查现有数据库..."
EXISTING_DB=$($WRANGLER_CMD d1 list 2>/dev/null | grep "ainstr-db" || echo "")

if [ -n "$EXISTING_DB" ]; then
    echo -e "${YELLOW}⚠️  数据库 'ainstr-db' 已存在${NC}"
    echo ""
    echo "现有数据库："
    $WRANGLER_CMD d1 list | grep -A 5 "ainstr-db" || true
    echo ""
    read -p "是否要创建新数据库？(y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "使用现有数据库..."

        # 从列表获取 database_id
        DB_INFO=$($WRANGLER_CMD d1 info ainstr-db 2>&1 || echo "")
        if [[ $DB_INFO == *"database_id"* ]]; then
            DB_ID=$(echo "$DB_INFO" | grep -oP '(?<=database_id = ")[^"]*' || echo "")
            if [ -n "$DB_ID" ]; then
                echo -e "${GREEN}✅ 找到数据库 ID: $DB_ID${NC}"
            fi
        fi
    else
        CREATE_NEW=true
    fi
else
    CREATE_NEW=true
fi

# 创建数据库
if [ "$CREATE_NEW" = true ]; then
    echo ""
    echo "📋 创建新的 D1 数据库..."
    echo "   数据库名称: ainstr-db"
    echo ""

    CREATE_OUTPUT=$($WRANGLER_CMD d1 create ainstr-db 2>&1)
    echo "$CREATE_OUTPUT"

    # 提取 database_id
    DB_ID=$(echo "$CREATE_OUTPUT" | grep -oP '(?<=database_id = ")[^"]*' || echo "")

    if [ -z "$DB_ID" ]; then
        # 尝试另一种方式提取
        DB_ID=$(echo "$CREATE_OUTPUT" | grep "database_id" | sed -n 's/.*database_id = "\([^"]*\)".*/\1/p' || echo "")
    fi

    if [ -n "$DB_ID" ]; then
        echo ""
        echo -e "${GREEN}✅ 数据库创建成功！${NC}"
        echo "   Database ID: $DB_ID"
    else
        echo -e "${RED}❌ 无法提取 database_id，请手动从输出中复制${NC}"
        echo ""
        echo "请手动执行："
        echo "  $WRANGLER_CMD d1 create ainstr-db"
        echo ""
        read -p "请输入 database_id: " DB_ID
    fi
fi

# 更新 wrangler.jsonc
if [ -n "$DB_ID" ]; then
    echo ""
    echo "📋 更新 wrangler.jsonc..."

    # 检查文件是否存在
    if [ ! -f "wrangler.jsonc" ]; then
        echo -e "${RED}❌ wrangler.jsonc 文件不存在${NC}"
        exit 1
    fi

    # 备份原文件
    cp wrangler.jsonc wrangler.jsonc.bak

    # 更新 database_id（使用 sed 或 python）
    if command -v python3 &> /dev/null; then
        python3 << EOF
import json
import re

# 读取文件
with open('wrangler.jsonc', 'r') as f:
    content = f.read()

# 移除注释后解析 JSON
json_str = re.sub(r'//.*', '', content)
config = json.loads(json_str)

# 更新 database_id
if 'd1_databases' in config and len(config['d1_databases']) > 0:
    config['d1_databases'][0]['database_id'] = '$DB_ID'

# 写回文件（保持注释）
lines = content.split('\n')
result = []
for line in lines:
    if 'database_id' in line and '""' in line:
        # 替换空字符串为实际的 database_id
        result.append(line.replace('""', f'"$DB_ID"'))
    else:
        result.append(line)

with open('wrangler.jsonc', 'w') as f:
    f.write('\n'.join(result))
EOF
        echo -e "${GREEN}✅ wrangler.jsonc 已更新${NC}"
    else
        # 使用 sed 作为备选
        sed -i.bak "s/\"database_id\": \"\"/\"database_id\": \"$DB_ID\"/" wrangler.jsonc
        echo -e "${GREEN}✅ wrangler.jsonc 已更新（使用 sed）${NC}"
    fi

    # 验证更新
    if grep -q "\"database_id\": \"$DB_ID\"" wrangler.jsonc; then
        echo -e "${GREEN}✅ 验证成功：database_id 已正确更新${NC}"
    else
        echo -e "${YELLOW}⚠️  请手动检查 wrangler.jsonc 文件${NC}"
    fi
fi

# 初始化数据库
echo ""
echo "📋 初始化数据库 Schema..."
if [ ! -f "db/schema.sql" ]; then
    echo -e "${RED}❌ db/schema.sql 文件不存在${NC}"
    exit 1
fi

echo ""
read -p "是否现在初始化数据库 Schema？(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在初始化生产数据库..."
    $WRANGLER_CMD d1 execute ainstr-db --file=./db/schema.sql

    echo ""
    read -p "是否也初始化本地开发数据库？(y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在初始化本地数据库..."
        $WRANGLER_CMD d1 execute ainstr-db --local --file=./db/schema.sql
        echo -e "${GREEN}✅ 本地数据库已初始化${NC}"
    fi

    echo -e "${GREEN}✅ 生产数据库已初始化${NC}"
else
    echo "跳过 Schema 初始化"
    echo ""
    echo "您可以稍后手动执行："
    echo "  # 生产环境"
    echo "  $WRANGLER_CMD d1 execute ainstr-db --file=./db/schema.sql"
    echo ""
    echo "  # 本地开发"
    echo "  $WRANGLER_CMD d1 execute ainstr-db --local --file=./db/schema.sql"
fi

# 总结
echo ""
echo "================================"
echo -e "${GREEN}✅ Cloudflare D1 配置完成！${NC}"
echo ""
echo "📋 配置摘要："
echo "   - 数据库名称: ainstr-db"
if [ -n "$DB_ID" ]; then
    echo "   - Database ID: $DB_ID"
fi
echo "   - 配置文件: wrangler.jsonc"
echo ""
echo "📝 下一步："
echo "   1. 检查 wrangler.jsonc 中的 database_id 是否正确"
echo "   2. 配置环境变量（.dev.vars）"
echo "   3. 测试数据库连接"
echo ""
echo "🧪 测试数据库："
echo "   # 查看数据库信息"
echo "   $WRANGLER_CMD d1 info ainstr-db"
echo ""
echo "   # 执行 SQL 查询"
echo "   $WRANGLER_CMD d1 execute ainstr-db --command=\"SELECT name FROM sqlite_master WHERE type='table';\""
echo ""

