#!/usr/bin/env python3
import subprocess
import json
import time

# 完整的curl命令参数
COOKIES = 'cna=cAShIM33lxUCAXPOep8X1ti3; _ga=GA1.1.1010479972.1746540150; h_uid=2219791990034; _gcl_au=1.1.1948146928.1759365413; csrf_session=MTc1OTM2NTQxNHxEWDhFQVFMX2dBQUJFQUVRQUFBeV80QUFBUVp6ZEhKcGJtY01DZ0FJWTNOeVpsTmhiSFFHYzNSeWFXNW5EQklBRUZKaWNFOTFOWFZyWmpKUVVISlZkR1k9fPC00ajueUA3Wv7KeHztpoyuAzCMnUJh4De1Tthf9KLA; csrf_token=4wNSbp0Rx2qL7QIeWMYUR6r6cOU%3D; _gcl_gs=2.1.k1$i1759366828$u71651727; _gcl_aw=GCL.1759366851.EAIaIQobChMIpa3nvMaFkAMVa-sWBR3A0QYlEAAYASADEgJag_D_BwE; t=1a5b1f2f6a81129bca720a75c6e98490; m_session_id=f18f2ef9-3dce-4366-940c-a00b21d69080; xlly_s=1; acw_tc=0bcd4c5217607177651504648e7dc32b48956f923e1f88ec7097cfa66398f6; _ga_K9CSTSKFC5=GS2.1.s1760713672$o13$g1$t1760717764$j60$l0$h0; isg=BC8v8h3Hm1RmnJ-AJ5JV8kybvkU51IP2JNSSq0G8yR6lkE-SSaQoR-sDE4Cuwltu; tfstk=gZGjB3XC0chzNIHLh58PFJoUxqP6YURFhNat-VCVWSFx1cinA552mSuO1uigQo32mVQmND1NgnvmW1Na6H-eTBu0o5V9Y_gWlmr0S4E9z-Ir5w046H-eabshRyNtbyo2yu38qP1Yk1nTw4UL55UYWlL72PahBinT6UT75yCA61UAyTU0J5EtX5LSyu4_6rnT6Ug8qPHFPsaylu0XJPSWafd5MuE561h7PhqKlu4urba0hkEUV1UjNrwbvqGQF9n05vhQnDKP3oHIuDaE0QCjAV3nB8G123Nizvi_RjLddlimyjy-MFW3r5Dtg7hv2BeuBAHUCYSvy5etGjFSUBbQ2jgsN-DP810Ydbh4iYtCTkHoWfw-oH63zA3EgAi2q1Eqd4n7LbSPTWHnVfwL9gWVTkZ25O_7K1a7YUT5IOq1son3yx2Fg-Uuzh8WP9ugHz4SeUT5IO2YrzrJPU6ES; acw_sc__v2=197d84838-bdc8c4c72ef03ea26cbc2a4929e43eed57d6ed582674296576; ssxmod_itna=1-eqrtDI4mxjOh0KpRTxfEDeu4AxCqGHDyxWFK0CDmxjKid3DUDQqlGC3BG5uhyGcxDBA7iitGFmqDsVDxiNDAc40iDC4WdtxNmwhvqF/=GE4NPKmwqvq3r0zG89zlemj4pXwy/i/c3vH5kChKD=ZDDwxibDBKDnr4DjxRrDeWaDCeDQxirDD4DA0Bwi4Dd18EIzbYo=/Dm14GWmj73mDGCy4Gt138ms4dDE0L6Dm9os4Dae3QDixoDc1bvH8MqDD5WesAnQ7hPI4iadz_cmCY2D7K2mmbvD7c6viQDX6Y031gluq0Oib4XdSi0DWZ4bDqe3Gq3ohGGd3YYG04QrKPEDLrKQBYCGY/7DpowY2qNmYq24gDhvmdQd==jpC7DQDegws/qG4eeiQYRDNlWiGiK_m5FGxx2QG0qIW5l05u2qRYQieqPYw_n43Ap3AD4D; ssxmod_itna2=1-eqrtDI4mxjOh0KpRTxfEDeu4AxCqGHDyxWFK0CDmxjKid3DUDQqlGC3BG5uhyGcxDBA7iitGFD4DWGlCmr04DFEYqEtx0yxEkcOWx56CpKlD9xwp0GxFOTsoTfQPvP36PNgF0Sg6PPRoqFCGFdRemCnOA522hWGaiWehad1icWRY7dPopPRP9IWZBDjEiCaf5sDUgW1DRxGedju9mPgjTNSBxwFWnLVbMx4D' \
  -H 'Origin: https://modelscope.cn' \
  -H 'Referer: https://modelscope.cn/mcp?page=1' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' \
  -H 'X-CSRF-TOKEN: 4wNSbp0Rx2qL7QIeWMYUR6r6cOU=' \
  -H 'X-Modelscope-Trace-Id: 91ad7026-9bc5-473d-8273-8a6f6960f57b' \
  -H 'sec-ch-ua: "Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'x-modelscope-accept-language: zh_CN' \
  --data-raw '{"PageSize":30,"PageNumber":1,"Query":"","Criterion":[]}' > src/data/page1_raw.json && echo "Page 1 saved" && tail -c 200 src/data/page1_raw.json
