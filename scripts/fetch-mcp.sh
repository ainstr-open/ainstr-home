#!/bin/bash

# 创建数据目录
mkdir -p src/data

COOKIES='cna=cAShIM33lxUCAXPOep8X1ti3; csrf_token=4wNSbp0Rx2qL7QIeWMYUR6r6cOU%3D; t=1a5b1f2f6a81129bca720a75c6e98490; acw_sc__v2=197d84838-b050dd5327f6d707658ffbdb2a9a0fd0583d06bf1e7c7f4d3a'
CSRF_TOKEN='4wNSbp0Rx2qL7QIeWMYUR6r6cOU='

echo "开始获取MCP数据..."

# 临时文件
TEMP_FILE="/tmp/mcp_all_data.json"
echo '[]' > $TEMP_FILE

# 获取10页数据（每页30条，共300条左右）
for i in {1..10}; do
  echo "获取第 $i 页..."

  RESPONSE=$(curl -s 'https://modelscope.cn/api/v1/dolphin/mcpServers' \
    -X 'PUT' \
    -H 'Content-Type: application/json' \
    -b "$COOKIES" \
    -H 'X-CSRF-TOKEN: '$CSRF_TOKEN \
    -H 'User-Agent: Mozilla/5.0' \
    --data-raw "{\"PageSize\":30,\"PageNumber\":$i,\"Query\":\"\",\"Criterion\":[]}")

  # 提取Servers数组并追加
  SERVERS=$(echo "$RESPONSE" | jq '.Data.Servers // []')

  if [ "$SERVERS" != "[]" ] && [ "$SERVERS" != "null" ]; then
    # 合并数据
    TEMP_DATA=$(jq --argjson new "$SERVERS" '. + $new' $TEMP_FILE)
    echo "$TEMP_DATA" > $TEMP_FILE
    echo "第 $i 页完成"
  else
    echo "第 $i 页无数据"
    break
  fi

  sleep 0.3
done

# 保存最终文件
mv $TEMP_FILE src/data/mcp-all-services.json

COUNT=$(jq 'length' src/data/mcp-all-services.json)
echo "========================"
echo "✅ 数据获取完成！"
echo "总计: $COUNT 条MCP服务"
echo "保存位置: src/data/mcp-all-services.json"
echo "========================"
