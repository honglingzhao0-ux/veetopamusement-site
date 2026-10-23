#!/usr/bin/env python
# ============================================================
# 实测站点询盘通道（Formspree + 邮件）
#
# 关键手法：Formspree 提交成功时，返回的 JSON 里会带 "email" 字段
#           = 该表单实际绑定的收件邮箱。
#           提交一个探针表单就能读出 Formspree 到底把询盘送到哪。
#
# 探针内容明确标注为测试，方便你在后台一眼识别并忽略。
# ============================================================
import json
import urllib.request
import urllib.error

ENDPOINT = "https://formspree.io/f/xnpqgnoz"
PROBE = {
    "_subject": "[WORKBUDDY PROBE] channel test - ignore",
    "name": "WorkBuddy Channel Test",
    "email": "probe@workbuddy-check.com",
    "message": "Connectivity probe. Please ignore. Not a real inquiry.",
    "productInterest": "PROBE-NOT-A-REAL-ORDER",
    "_probe": "workbuddy-2026-10-22",
}


def post(url, data, headers=None):
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"),
                                 headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"


def get(url):
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"


print("=" * 70)
print("1. Formspree 表单公开配置")
print("=" * 70)
st, body = get(f"{ENDPOINT}.json")
print(f"GET {ENDPOINT}.json → {st}")
if st == 200:
    try:
        d = json.loads(body)
        for k in ("id", "name", "email", "url", "emailConfirmed",
                  "spamProtection", "referrer", "isActive"):
            if k in d:
                print(f"   {k:<18} = {d[k]}")
    except Exception:
        print(body[:400])
else:
    print("   ", (body or "")[:300])

print()
print("=" * 70)
print("2. 提交探针表单（读回实际收件邮箱）")
print("=" * 70)
st, body = post(ENDPOINT, PROBE)
print(f"POST {ENDPOINT} → {st}")
print("响应原文:")
for line in (body or "").splitlines()[:25]:
    print("   ", line[:200])
