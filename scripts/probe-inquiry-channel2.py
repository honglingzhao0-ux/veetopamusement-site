#!/usr/bin/env python
# ============================================================
# 用真实浏览器 UA / 完整请求头重测 Formspree
# （排除 Cloudflare 因请求特征误判而拦截的可能）
# ============================================================
import json
import urllib.request
import urllib.error

ENDPOINT = "https://formspree.io/f/xnpqgnoz"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

PROBE = {
    "_subject": "[WORKBUDDY PROBE] channel test - please ignore",
    "name": "WorkBuddy Channel Test",
    "email": "probe@workbuddy-check.com",
    "message": "Connectivity probe. Please ignore. Not a real inquiry.",
    "productInterest": "PROBE-NOT-A-REAL-ORDER",
    "_probe": "workbuddy-2026-10-22-ua-test",
}

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": UA,
    "Origin": "https://www.veetopamusement.com",
    "Referer": "https://www.veetopamusement.com/contact/",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
}


def run(label, url, data=None, method="GET", extra=None):
    h = dict(HEADERS)
    if extra:
        h.update(extra)
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            try:
                txt = raw.decode("utf-8")
            except UnicodeDecodeError:
                import gzip
                txt = gzip.decompress(raw).decode("utf-8", "replace")
            print(f"[{label}] {method} → HTTP {r.status}")
            for line in txt.splitlines()[:15]:
                print("    ", line[:190])
            return r.status, txt
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            txt = raw.decode("utf-8")
        except UnicodeDecodeError:
            txt = str(raw[:300])
        print(f"[{label}] {method} → HTTP {e.code}")
        for line in txt.splitlines()[:12]:
            print("    ", line[:190])
        return e.code, txt
    except Exception as e:
        print(f"[{label}] {method} → {type(e).__name__}: {e}")
        return None, ""


print("=" * 72)
print("A. 带完整浏览器头 POST 探针")
print("=" * 72)
run("formspree", ENDPOINT, PROBE, "POST")

print()
print("=" * 72)
print("B. 读表单公开配置")
print("=" * 72)
run("formspree-json", f"{ENDPOINT}.json", None, "GET")

print()
print("=" * 72)
print("C. 表单页本身能否打开（说明是端点被封还是整站被封）")
print("=" * 72)
run("formspree-page", f"https://formspree.io/f/xnpqgnoz", None, "GET")
run("formspree-root", "https://formspree.io/", None, "GET")

print()
print("=" * 72)
print("D. 站点表单实际会发的字段（从代码里查）")
print("=" * 72)
import re
import os
p = "components/inquiry-form.tsx"
if os.path.exists(p):
    src = open(p, encoding="utf-8").read()
    fields = re.findall(r'name=\{?["\']([a-zA-Z_]+)["\']', src)
    print("   表单字段:", sorted(set(fields)))
    for kw in ("_subject", "formEndpoint", "method", "action"):
        for m in re.finditer(kw, src):
            line = src[:m.start()].count("\n") + 1
            print(f"   {kw:<14} 出现在第 {line} 行")
            break
else:
    print("   找不到", p)
