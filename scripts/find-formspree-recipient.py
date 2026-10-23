#!/usr/bin/env python
# ============================================================
# 查明 Formspree 表单的实际收件邮箱
#
# 尝试的公开端点（Formspree 未文档化但常用的）：
#   GET  {endpoint}.json      → 表单公开配置
#   GET  {endpoint}?format=json
#   POST {endpoint}           → 提交时若带 _probe=xxx 不会回显收件人
#   GET  https://api.formspree.io/v1/forms/{id}   → 需 token
#
# 另外：用「回信探测」法 —— 若 Formspree 转发到某邮箱，
#   我们无法直接读。但可以查该域名的 SPF/退信行为来反推。
#
# 输出结论分三类：
#   A. 直接读到收件邮箱 → 明确
#   B. 读不到 → 需要你登 Formspree 后台确认
# ============================================================
import json
import urllib.request
import urllib.error

ENDPOINT = "https://formspree.io/f/xnpqgnoz"
FORM_ID = "xnpqgnoz"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
H = {
    "User-Agent": UA,
    "Accept": "application/json",
    "Origin": "https://www.veetopamusement.com",
    "Referer": "https://www.veetopamusement.com/contact/",
}


def req(url, method="GET", data=None):
    body = json.dumps(data).encode() if data else None
    h = dict(H)
    if body:
        h["Content-Type"] = "application/json"
    r = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=25) as resp:
            raw = resp.read()
            try:
                return resp.status, raw.decode("utf-8")
            except UnicodeDecodeError:
                import gzip
                return resp.status, gzip.decompress(raw).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        try:
            return e.code, e.read().decode("utf-8", "replace")
        except Exception:
            return e.code, ""
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"


print("=" * 72)
print("尝试读取 Formspree 表单收件配置")
print("=" * 72)

attempts = [
    (f"{ENDPOINT}.json", "GET", None),
    (f"{ENDPOINT}?format=json", "GET", None),
    (f"https://api.formspree.io/v1/forms/{FORM_ID}", "GET", None),
    (f"https://formspree.io/f/{FORM_ID}.json", "GET", None),
]
for url, method, data in attempts:
    st, body = req(url, method, data)
    ok = "✅" if st == 200 else " "
    print(f"{ok} {st}  {url}")
    if st == 200:
        try:
            d = json.loads(body)
            # 只打印与收件相关字段
            for k in ("email", "name", "id", "emailConfirmed", "isActive",
                      "spamProtection", "forwardTo", "recipient", "inbox"):
                if k in d:
                    print(f"        {k} = {d[k]}")
        except Exception:
            print("     ", body[:200])

print()
print("=" * 72)
print("结论判定")
print("=" * 72)
st, body = req(f"{ENDPOINT}.json")
if st == 200:
    print("✅ 能读到公开配置，收件邮箱已在上方列出")
else:
    print("⚠️  Formspree 未公开暴露收件邮箱（这是设计如此，属正常）")
    print()
    print("可行的确认方式（三选一，都很快）：")
    print("  1) 打开 https://formspree.io/forms → 用建表单时的邮箱登录")
    print("     → 找到 xnpqgnoz 这个表单 → 看 Settings 里的 To 字段")
    print("  2) 直接搜收件箱：标题 'VEETOP website inquiry'（站点表单的 _subject）")
    print("     —— 我刚才的探针标题是 '[WORKBUDDY PROBE] channel test'")
    print("  3) 换个思路：把 Formspree 的收件人改成 Sales@veetopamusement.com，")
    print("     让两条通道汇到同一个邮箱（推荐做法）")
