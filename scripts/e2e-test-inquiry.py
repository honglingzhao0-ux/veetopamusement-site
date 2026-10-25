#!/usr/bin/env python
# ============================================================
# 线上端到端实测：完全按浏览器行为向线上表单通道提交一封询盘
#
# 复刻站点 components/inquiry-form.tsx + lib/inquiry.ts 的实际请求：
#   POST https://api.web3forms.com/submit
#   Content-Type: application/json
#   Accept: application/json
#   Origin: https://www.veetopamusement.com
#   body: { ...表单字段..., access_key, _subject, source }
#
# 提交前先从线上 contact 页把真实的 access_key 抓出来（验证线上确实带着 key）
# ============================================================
import json
import re
import urllib.request
import urllib.error

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
PAGE = "https://www.veetopamusement.com/contact/"
ENDPOINT = "https://api.web3forms.com/submit"

print("=" * 70)
print("1. 从线上页面抓取真实 access_key")
print("=" * 70)
req = urllib.request.Request(PAGE, headers={"User-Agent": UA})
page = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
m = re.search(r'name="access_key"\s+value="([^"]+)"', page)
if not m:
    m = re.search(r'value="([^"]+)"[^>]*name="access_key"', page)
if not m:
    print("❌ 线上页面里没找到 access_key")
    raise SystemExit(1)
key = m.group(1)
print(f"   抓到的 key: {key[:12]}...{key[-6:]}  (长度 {len(key)})")

print()
print("=" * 70)
print("2. 用线上 key 提交一封测试询盘（模拟客户填表）")
print("=" * 70)
payload = {
    "_subject": "VEETOP website inquiry",
    "access_key": key,
    "name": "End-to-End Test - Channel Verification",
    "company": "Test Buyer Co., Ltd.",
    "email": "probe@workbuddy-check.com",
    "country": "United States",
    "productInterest": "VTSP007 (Boxing IB)",
    "quantity": "5-20 units",
    "businessType": "Distributor / wholesaler",
    "source": "veetopamusement.com website",
    "message": "End-to-end test through the live website form channel. "
               "Please ignore - not a real request.",
}
req = urllib.request.Request(
    ENDPOINT,
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": UA,
        "Origin": "https://www.veetopamusement.com",
        "Referer": PAGE,
    },
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=40) as r:
        body = r.read().decode("utf-8", "replace")
        print(f"   HTTP {r.status}")
        print("   响应:", body[:260])
        d = json.loads(body)
        if d.get("success"):
            print("\n✅ 端到端通过：线上表单 → Web3Forms → 收件箱")
            print("   请去 sales@veetopamusement.com 确认收到")
            print("   标题应为 'VEETOP website inquiry'")
            print("   来源标记 source = veetopamusement.com website")
except urllib.error.HTTPError as e:
    print(f"   HTTP {e.code}")
    print("   响应:", e.read().decode("utf-8", "replace")[:300])
except Exception as e:
    print(f"   ERR {type(e).__name__}: {e}")
