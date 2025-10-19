#!/usr/bin/env python3
import json
import subprocess
import time

COOKIES = 'cna=cAShIM33lxUCAXPOep8X1ti3; csrf_token=4wNSbp0Rx2qL7QIeWMYUR6r6cOU%3D; t=1a5b1f2f6a81129bca720a75c6e98490; acw_sc__v2=197d84838-b050dd5327f6d707658ffbdb2a9a0fd0583d06bf1e7c7f4d3a'
CSRF_TOKEN = '4wNSbp0Rx2qL7QIeWMYUR6r6cOU='
TOTAL_PAGES = 10  # 获取前10页数据

print("开始获取MCP服务数据...")

all_servers = []

for page in range(1, TOTAL_PAGES + 1):
    print(f"正在获取第 {page}/{TOTAL_PAGES} 页...")

    curl_cmd = [
        'curl', '-s',
        'https://modelscope.cn/api/v1/dolphin/mcpServers',
        '-X', 'PUT',
        '-H', 'Content-Type: application/json',
        '-b', COOKIES,
        '-H', f'X-CSRF-TOKEN: {CSRF_TOKEN}',
        '-H', 'User-Agent: Mozilla/5.0',
        '--data-raw', json.dumps({
            "PageSize": 30,
            "PageNumber": page,
            "Query": "",
            "Criterion": []
        })
    ]

    try:
        result = subprocess.run(curl_cmd, capture_output=True, text=True)
        response_text = result.stdout

        # 解析JSON
        data = json.loads(response_text)

        if data.get('Success') and data.get('Data', {}).get('Servers'):
            servers = data['Data']['Servers']
            all_servers.extend(servers)
            print(f"  ✓ 获取到 {len(servers)} 条数据")

            # 显示总数信息
            if page == 1:
                total_count = data['Data'].get('TotalCount', 0)
                print(f"  总共有 {total_count} 条MCP服务")
        else:
            print(f"  ✗ 第 {page} 页获取失败或无数据")
            break

    except json.JSONDecodeError as e:
        print(f"  ✗ JSON解析失败: {e}")
        break
    except Exception as e:
        print(f"  ✗ 错误: {e}")
        break

    # 延迟避免请求过快
    time.sleep(0.3)

# 保存到文件
output_path = 'src/data/mcp-all-services.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(all_servers, f, ensure_ascii=False, indent=2)

print("\n" + "="*50)
print(f"✅ 数据已保存到 {output_path}")
print(f"📊 总计: {len(all_servers)} 条MCP服务")
print("="*50)

# 统计分类
categories = {}
for server in all_servers:
    cats = server.get('Category', [])
    if isinstance(cats, list):
        for cat in cats:
            categories[cat] = categories.get(cat, 0) + 1

print("\n分类统计:")
for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
    print(f"  {cat}: {count}")

