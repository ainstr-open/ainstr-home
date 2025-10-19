#!/usr/bin/env python3
import subprocess
import json
import time

COOKIE = 'cna=cAShIM33lxUCAXPOep8X1ti3; _ga=GA1.1.1010479972.1746540150; h_uid=2219791990034; csrf_token=4wNSbp0Rx2qL7QIeWMYUR6r6cOU%3D; t=1a5b1f2f6a81129bca720a75c6e98490; acw_tc=0bcd4c5217607177651504648e7dc32b48956f923e1f88ec7097cfa66398f6; isg=BC8v8h3Hm1RmnJ-AJ5JV8kybvkU51IP2JNSSq0G8yR6lkE-SSaQoR-sDE4Cuwltu; acw_sc__v2=197d84838-bdc8c4c72ef03ea26cbc2a4929e43eed57d6ed582674296576'
CSRF_TOKEN = '4wNSbp0Rx2qL7QIeWMYUR6r6cOU='

def fetch_page(page_num, page_size=100):
    curl_cmd = [
        'curl', '-s',
        'https://modelscope.cn/api/v1/dolphin/mcpServers',
        '-X', 'PUT',
        '-H', 'Accept: application/json, text/plain, */*',
        '-H', 'Content-Type: application/json',
        '-b', COOKIE,
        '-H', f'X-CSRF-TOKEN: {CSRF_TOKEN}',
        '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        '--data-raw', json.dumps({
            "PageSize": page_size,
            "PageNumber": page_num,
            "Query": "",
            "Criterion": []
        })
    ]

    result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
    return json.loads(result.stdout)

print("开始获取全部MCP服务数据...")

all_servers = []
categories = []
total_count = 0

# 第一页获取分类信息
print("\n正在获取分类信息...")
try:
    response = fetch_page(1, 100)
    if response.get('Success'):
        data = response.get('Data', {})
        categories = data.get('FiledAgg', {}).get('Category', [])
        print(f"✓ 获取到 {len(categories)} 个分类")

        mcp_data = data.get('McpServer', {})
        total_count = mcp_data.get('TotalCount', 0)
        print(f"✓ 总服务数: {total_count}")
except Exception as e:
    print(f"✗ 错误: {e}")
    exit(1)

# 计算需要获取的页数
total_pages = (total_count + 99) // 100
print(f"\n需要获取 {total_pages} 页数据")

# 获取所有页面
max_pages = min(total_pages, 60)  # 最多获取60页，避免请求过多
print(f"将获取前 {max_pages} 页（共 {max_pages * 100} 条数据）")

for page in range(1, max_pages + 1):
    print(f"\r正在获取第 {page}/{max_pages} 页...", end='', flush=True)

    try:
        response = fetch_page(page, 100)

        if response.get('Success'):
            mcp_data = response.get('Data', {}).get('McpServer', {})
            servers = mcp_data.get('McpServers', [])

            if servers:
                all_servers.extend(servers)
            else:
                print(f"\n第 {page} 页无数据，停止获取")
                break
        else:
            print(f"\n第 {page} 页请求失败，停止获取")
            break

    except Exception as e:
        print(f"\n第 {page} 页错误: {e}，停止获取")
        break

    # 每10页延迟稍长一些
    if page % 10 == 0:
        time.sleep(1)
    else:
        time.sleep(0.3)

print(f"\n\n获取完成！")

# 保存数据
output = {
    "categories": categories,
    "servers": all_servers,
    "totalCount": total_count,
    "fetchedCount": len(all_servers)
}

with open('src/data/mcp-data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\n" + "="*60)
print(f"✅ 数据已保存到 src/data/mcp-data.json")
print(f"📊 获取 {len(all_servers)}/{total_count} 条服务")
print(f"📂 {len(categories)} 个分类")
print(f"📄 文件大小: {len(json.dumps(output, ensure_ascii=False)) / 1024 / 1024:.2f} MB")
print("="*60)

