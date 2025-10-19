#!/bin/bash

# 创建数据目录
mkdir -p src/data

# Cookie和认证信息
COOKIES='cna=cAShIM33lxUCAXPOep8X1ti3; _ga=GA1.1.1010479972.1746540150; h_uid=2219791990034; _gcl_au=1.1.1948146928.1759365413; csrf_session=MTc1OTM2NTQxNHxEWDhFQVFMX2dBQUJFQUVRQUFBeV80QUFBUVp6ZEhKcGJtY01DZ0FJWTNOeVpsTmhiSFFHYzNSeWFXNW5EQklBRUZKaWNFOTFOWFZyWmpKUVVISlZkR1k9fPC00ajueUA3Wv7KeHztpoyuAzCMnUJh4De1Tthf9KLA; csrf_token=4wNSbp0Rx2qL7QIeWMYUR6r6cOU%3D; t=1a5b1f2f6a81129bca720a75c6e98490; m_session_id=f18f2ef9-3dce-4366-940c-a00b21d69080; xlly_s=1; acw_tc=0bcd4ce217607156957428629e63046dc6313d0860c760ecc228ad79a2a859; acw_sc__v2=197d84838-b050dd5327f6d707658ffbdb2a9a0fd0583d06bf1e7c7f4d3a; isg=BEpKIiyoFneWe5ozEo3IMYGsmzbsO86V-UNXeNSCVR0Sh-lBvMiqpbO0lvNbTUYt'
CSRF_TOKEN='4wNSbp0Rx2qL7QIeWMYUR6r6cOU='

echo "开始获取MCP服务数据..."

# 首先获取第一页以确定总数
RESPONSE=$(curl -s 'https://modelscope.cn/api/v1/dolphin/mcpServers' \
  -X 'PUT' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' \
  -H 'Content-Type: application/json' \
  -b "$COOKIES" \
  -H 'Origin: https://modelscope.cn' \
  -H 'Referer: https://modelscope.cn/mcp?page=1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' \
  -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
  --data-raw '{"PageSize":30,"PageNumber":1,"Query":"","Criterion":[]}')

# 提取总数
TOTAL_COUNT=$(echo "$RESPONSE" | jq -r '.Data.TotalCount // 0' 2>/dev/null)

if [ "$TOTAL_COUNT" -eq 0 ]; then
  echo "无法获取数据或总数为0"
  echo "$RESPONSE" | head -50
  exit 1
fi

echo "总共有 $TOTAL_COUNT 条数据"

# 计算需要获取的页数
TOTAL_PAGES=$(( (TOTAL_COUNT + 29) / 30 ))
echo "需要获取 $TOTAL_PAGES 页"

# 初始化JSON数组文件
echo '{"servers": [' > src/data/mcp-all-services.json

for i in $(seq 1 $TOTAL_PAGES); do
  echo "正在获取第 $i/$TOTAL_PAGES 页..."

  # 发送请求
  PAGE_RESPONSE=$(curl -s 'https://modelscope.cn/api/v1/dolphin/mcpServers' \
    -X 'PUT' \
    -H 'Accept: application/json, text/plain, */*' \
    -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' \
    -H 'Content-Type: application/json' \
    -b "$COOKIES" \
    -H 'Origin: https://modelscope.cn' \
    -H "Referer: https://modelscope.cn/mcp?page=$i" \
    -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' \
    -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
    --data-raw "{\"PageSize\":30,\"PageNumber\":$i,\"Query\":\"\",\"Criterion\":[]}")

  # 提取服务器数据
  SERVERS=$(echo "$PAGE_RESPONSE" | jq -c '.Data.Servers[]' 2>/dev/null)

  if [ -n "$SERVERS" ]; then
    # 添加到文件，除了最后一页，每页后面加逗号
    if [ $i -lt $TOTAL_PAGES ]; then
      echo "$SERVERS" | sed 's/$/,/' >> src/data/mcp-all-services.json
    else
      echo "$SERVERS" >> src/data/mcp-all-services.json
    fi

    COUNT=$(echo "$SERVERS" | wc -l | tr -d ' ')
    echo "第 $i 页获取成功，获得 $COUNT 条数据"
  else
    echo "第 $i 页获取失败"
  fi

  # 延迟避免请求过快
  sleep 0.5
done

# 关闭JSON数组
echo '], "totalCount": '$TOTAL_COUNT', "fetchedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' >> src/data/mcp-all-services.json

echo "数据获取完成！"
echo "数据已保存到 src/data/mcp-all-services.json"

# 格式化JSON
if command -v jq &> /dev/null; then
  jq '.' src/data/mcp-all-services.json > src/data/mcp-all-services-formatted.json
  mv src/data/mcp-all-services-formatted.json src/data/mcp-all-services.json
  echo "JSON格式化完成"
fi

# 统计信息
echo "====================="
echo "数据统计："
echo "总数量: $TOTAL_COUNT"
echo "获取页数: $TOTAL_PAGES"
jq '.servers | length' src/data/mcp-all-services.json 2>/dev/null && echo "实际保存数量: $(jq '.servers | length' src/data/mcp-all-services.json)"
