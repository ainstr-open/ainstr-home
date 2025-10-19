#!/usr/bin/env python3
import subprocess
import json
import time

COOKIE = 'cna=cAShIM33lxUCAXPOep8X1ti3; _ga=GA1.1.1010479972.1746540150; _gcl_au=1.1.1948146928.1759365413; csrf_session=MTc1OTM2NTQxNHxEWDhFQVFMX2dBQUJFQUVRQUFBeV80QUFBUVp6ZEhKcGJtY01DZ0FJWTNOeVpsTmhiSFFHYzNSeWFXNW5EQklBRUZKaWNFOTFOWFZyWmpKUVVISlZkR1k9fPC00ajueUA3Wv7KeHztpoyuAzCMnUJh4De1Tthf9KLA; csrf_token=4wNSbp0Rx2qL7QIeWMYUR6r6cOU%3D; _gcl_gs=2.1.k1$i1759366828$u71651727; _gcl_aw=GCL.1759366851.EAIaIQobChMIpa3nvMaFkAMVa-sWBR3A0QYlEAAYASADEgJag_D_BwE; t=1a5b1f2f6a81129bca720a75c6e98490; xlly_s=1; _ga_K9CSTSKFC5=GS2.1.s1760793490$o15$g1$t1760793492$j58$l0$h0; tfstk=gjzEa5s4M42suov1RR3y_dT5PE0Kr4WXTzMSZ7VoOvD3O2GyzRF8Rvg59lkzQAnQR4azXUPYwy1KP63L943lht_fhWFKyKuIaMW_s_c-zXb1yrQu943lCCTlcZPLpQLw0D0l_Vcoap0kx0fZSbGjremk-hviBb0orvmosAcIg3DoEDfasAhorY2ox1oiBb0oE80oKya0ydlSx17T0zAV-XnEnWDwo5aZtm-LtA8DoPosYxYSQUYu7XVyT_up-ZkgAu4ISyXMWVVYfJcZuwJxTlVq-XyRke33i5qoYzSWMYEasoiaXB1-ePPg-uV9LTcTqJgiI8vFTYzgd83QS_xnnkwIVPoHI6k8RJzrvrXXWvqaWzuQf98je0q_JmUCIeu0DWgQq-X6AvqqZgkpefXC_zEeE3on6fkf_1SBXVP1szPh43K-v6hZh6mH23n3ufkf_1-J2Dhq_x1nx; isg=BIKCev7pXq77UUKb6nUw2QnU047kU4ZtAatv0Mybo_WgHyKZtODpfZVdzhtjDP4F; acw_sc__v2=197d84838-b0ec241c2967059060335c660ceb67ce9221e909621c571f32; ssxmod_itna=1-eqrtDI4mxjOh0KpRTxfEDeu4AxCqGHDyxWFK0CDmxjKid3DUDQqlGC3BG5uhHhQv4elDD5iRKmqDsqjD4GzDiLPGhDBeAFCYzY5qN5jnCDTP/btGqvq3r0FYONPdLioMnLksBU89RoRm5c20rGDiTND07DmeDUxD1mDDkG0xYDemaDCeDQxirDD4DAB7mb4DdGIOvh8YoN/GmG4GWmn73mDGCS4GtGFSm_tdDElkUDm9o_4DaKFQDiooDc14A8IMqDDHW5v7cQ7hPE4ia=zb9mmB2D792mm4AD7pUvCQDXcB03EEZ9q0Ob_eVfro4Kw47b87GixCioQee1rxK24QxoeEDLrKQ0bCixSGDIOwGAD4_Yznmtoo1rpGBOdnY1EdC7De_sVdGqjGG0YqAtjgv9gY4_5FGxe25MQ5MA5V04=7Deoo7ADkWitP_djD4D; ssxmod_itna2=1-eqrtDI4mxjOh0KpRTxfEDeu4AxCqGHDyxWFK0CDmxjKid3DUDQqlGC3BG5uhHhQv4elDD5iRKD4DWg77nqWDLloSDvDBT9xOaVPZRxPHk=0bWR5_3T9Btv6Bo8x_wozziSc6X5pxMF8cvCnh9OzOT4Hp9DT2x53FP5fO27BEFCKCppXQp5Hg7WIxnv3laERYKfaPFH5QIqvEG1Sc4AX0Pba8HhAtKHDf9wEpKr500aPCyjUfi8X07XCWSd_tiFMRi088FzjaS_zY9Uv3Fdz7hOF=d5F7nxGDVMRq_rS0wNR7rqqiWbuVXDD'
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

print("开始获取所有MCP服务数据...")

all_servers = []
categories = []
total_count = 0

# 获取所有页数据 (每页100条，总共约56页)
max_pages = 60  # 获取前60页，覆盖所有数据
for page in range(1, max_pages + 1):
    print(f"\n正在获取第 {page} 页...")

    try:
        response = fetch_page(page, 100)

        if response.get('Success'):
            data = response.get('Data', {})

            # 第一页保存分类信息
            if page == 1:
                categories = data.get('FiledAgg', {}).get('Category', [])
                print(f"  ✓ 获取到 {len(categories)} 个分类")

            # 提取服务数据
            mcp_data = data.get('McpServer', {})
            servers = mcp_data.get('McpServers', [])
            total_count = mcp_data.get('TotalCount', 0)

            if servers:
                all_servers.extend(servers)
                print(f"  ✓ 获取到 {len(servers)} 条服务")
                print(f"  累计: {len(all_servers)}/{total_count}")
            else:
                print(f"  ✗ 无数据，停止获取")
                break
        else:
            print(f"  ✗ 请求失败")
            break

    except Exception as e:
        print(f"  ✗ 错误: {e}")
        break

    # 动态延迟，避免请求过快
    if page % 10 == 0:
        time.sleep(2)
        print(f"\n  💤 已获取 {page} 页，休息2秒...")
    else:
        time.sleep(0.8)

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
print("="*60)

