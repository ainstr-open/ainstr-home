#!/usr/bin/env python3
import subprocess
import json
import time
import os

# 创建数据目录
os.makedirs('src/data', exist_ok=True)

# 完整Cookie
HEADERS = [
    '-H', 'Accept: application/json, text/plain, */*',
    '-H', 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,th;q=0.7,ko;q=0.6',
    '-H', 'Connection: keep-alive',
    '-H', 'Content-Type: application/json',
    '-b', 'cna=cAShIM33lxUCAXPOep8X1ti3; _ga=GA1.1.1010479972.1746540150; h_uid=2219791990034; _gcl_au=1.1.1948146928.1759365413; csrf_session=MTc1OTM2NTQxNHxEWDhFQVFMX2dBQUJFQUVRQUFBeV80QUFBUVp6ZEhKcGJtY01DZ0FJWTNOeVpsTmhiSFFHYzNSeWFXNW5EQklBRUZKaWNFOTFOWFZyWmpKUVVISlZkR1k9fPC00ajueUA3Wv7KeHztpoyuAzCMnUJh4De1Tthf9KLA; csrf_token=4wNSbp0Rx2qL7QIeWMYUR6r6cOU%3D; t=1a5b1f2f6a81129bca720a75c6e98490; m_session_id=f18f2ef9-3dce-4366-940c-a00b21d69080; acw_tc=0bcd4c5217607177651504648e7dc32b48956f923e1f88ec7097cfa66398f6; isg=BC8v8h3Hm1RmnJ-AJ5JV8kybvkU51IP2JNSSq0G8yR6lkE-SSaQoR-sDE4Cuwltu; acw_sc__v2=197d84838-bdc8c4c72ef03ea26cbc2a4929e43eed57d6ed582674296576',
    '-H', 'Origin: https://modelscope.cn',
    '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    '-H', 'X-CSRF-TOKEN: 4wNSbp0Rx2qL7QIeWMYUR6r6cOU=',
    '-H', 'sec-ch-ua: "Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    '-H', 'sec-ch-ua-mobile: ?0',
    '-H', 'sec-ch-ua-platform: "macOS"',
]

print("开始获取MCP服务数据...")

all_servers = []
page_size = 100

for page in range(1, 20):  # 获取前20页
    print(f"\n正在获取第 {page} 页...")

    curl_cmd = [
        'curl', '-s',
        'https://modelscope.cn/api/v1/dolphin/mcpServers',
        '-X', 'PUT',
    ] + HEADERS + [
        '-H', f'Referer: https://modelscope.cn/mcp?page={page}',
        '--data-raw', json.dumps({
            "PageSize": page_size,
            "PageNumber": page,
            "Query": "",
            "Criterion": []
        })
    ]

    try:
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
        response_text = result.stdout

        # 解析JSON
        data = json.loads(response_text)

        if data.get('Success'):
            servers = data.get('Data', {}).get('McpServer', [])
            if servers:
                all_servers.extend(servers)
                print(f"  ✓ 获取到 {len(servers)} 条数据")
                print(f"  累计: {len(all_servers)} 条")
            else:
                print(f"  ✗ 无更多数据，停止获取")
                break
        else:
            print(f"  ✗ 请求失败")
            break

    except json.JSONDecodeError as e:
        print(f"  ✗ JSON解析失败，可能遇到WAF")
        break
    except Exception as e:
        print(f"  ✗ 错误: {e}")
        break

    # 延迟避免请求过快
    time.sleep(0.5)

# 保存到文件
output_path = 'src/data/mcp-all-services.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(all_servers, f, ensure_ascii=False, indent=2)

print("\n" + "="*60)
print(f"✅ 数据已保存到 {output_path}")
print(f"📊 总计: {len(all_servers)} 条MCP服务")
print("="*60)

# 统计分类
if all_servers:
    categories = {}
    for server in all_servers:
        cats = server.get('Category', [])
        if isinstance(cats, list):
            for cat in cats:
                categories[cat] = categories.get(cat, 0) + 1

    print("\n📂 分类统计 (Top 15):")
    for i, (cat, count) in enumerate(sorted(categories.items(), key=lambda x: x[1], reverse=True)[:15], 1):
        print(f"  {i:2d}. {cat:30s} {count:4d}")

