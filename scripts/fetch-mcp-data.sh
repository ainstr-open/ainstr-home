#!/bin/bash

# 创建数据目录
mkdir -p src/data

# 总页数（根据需要调整）
TOTAL_PAGES=10

echo "开始获取MCP服务数据..."

# 初始化JSON数组
echo "[" > src/data/mcp-services.json

for i in $(seq 1 $TOTAL_PAGES); do
  echo "正在获取第 $i 页..."

  # 发送请求
  RESPONSE=$(curl -s 'https://modelscope.cn/api/v1/dolphin/mcpServers' \
    -X 'PUT' \
    -H 'Accept: application/json, text/plain, */*' \
    -H 'Content-Type: application/json' \
    -H 'Origin: https://modelscope.cn' \
    -H 'Referer: https://modelscope.cn/mcp' \
    -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
    --data-raw "{\"PageSize\":30,\"PageNumber\":$i,\"Query\":\"\",\"Criterion\":[]}")

  # 检查响应是否为有效JSON
  if echo "$RESPONSE" | jq empty 2>/dev/null; then
    # 提取服务器数据
    SERVERS=$(echo "$RESPONSE" | jq -c '.Data.Servers[]' 2>/dev/null)

    if [ -n "$SERVERS" ]; then
      echo "$SERVERS" >> src/data/mcp-services-temp.json
      echo "第 $i 页获取成功"
    else
      echo "第 $i 页没有数据，停止获取"
      break
    fi
  else
    echo "第 $i 页返回非JSON数据，可能遇到防火墙，停止获取"
    break
  fi

  # 延迟1秒避免请求过快
  sleep 1
done

# 合并所有数据
if [ -f src/data/mcp-services-temp.json ]; then
  cat src/data/mcp-services-temp.json | jq -s '.' > src/data/mcp-services.json
  rm src/data/mcp-services-temp.json

  # 统计数据
  TOTAL=$(cat src/data/mcp-services.json | jq 'length')
  echo "数据获取完成！总计 $TOTAL 条MCP服务"
else
  echo "[]" > src/data/mcp-services.json
  echo "未能获取到数据"
fi

echo "数据已保存到 src/data/mcp-services.json"
