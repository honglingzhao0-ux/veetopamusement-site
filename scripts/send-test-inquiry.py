#!/usr/bin/env python
# ============================================================
# 通过站点真实表单通道发一封测试询盘
#
# 这条路径 = 客户在 https://www.veetopamusement.com/contact/ 填表提交
#   浏览器 → fetch POST multipart/form-data → Formspree → 收件邮箱
#
# 之前裸 JSON POST 会被 Cloudflare 403（Error 1010：缺 Origin）。
# 站点真实浏览器会带 Origin + Referer，且 body 是 FormData（multipart）。
# 这里完全复刻浏览器的行为。
# ============================================================
import io
import json
import urllib.request
import urllib.error
import uuid

ENDPOINT = "https://formspree.io/f/xnpqgnoz"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

# 与 components/inquiry-form.tsx 的字段完全一致
FIELDS = [
    ("_subject", "VEETOP website inquiry"),
    ("name", "Test Inquiry - Channel Verification"),
    ("company", "Test Buyer Co., Ltd."),
    ("email", "probe@workbuddy-check.com"),
    ("country", "United States"),
    ("productInterest", "VTSP007 (Boxing IB)"),
    ("quantity", "5-20 units"),
    ("businessType", "Distributor / wholesaler"),
    ("message",
     "This is a channel verification inquiry submitted through the live "
     "website form, exactly as an overseas customer would do it. "
     "Please ignore - not a real request."),
]


def build_multipart(fields):
    """手工构造 multipart/form-data（与浏览器 FormData 序列化一致）"""
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex[:16]
    buf = io.BytesIO()
    for name, value in fields:
        buf.write(f"--{boundary}\r\n".encode())
        buf.write(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        buf.write(f"{value}\r\n".encode())
    buf.write(f"--{boundary}--\r\n".encode())
    return buf.getvalue(), f"multipart/form-data; boundary={boundary}"


def main():
    body, ctype = build_multipart(FIELDS)
    headers = {
        "Content-Type": ctype,
        "Accept": "application/json",
        "User-Agent": UA,
        "Origin": "https://www.veetopamusement.com",
        "Referer": "https://www.veetopamusement.com/contact/",
        "Accept-Language": "en-US,en;q=0.9",
    }
    req = urllib.request.Request(ENDPOINT, data=body, headers=headers, method="POST")
    print("=" * 70)
    print("通过站点表单通道提交测试询盘")
    print("=" * 70)
    print(f"POST {ENDPOINT}")
    print(f"Content-Type: {ctype[:60]}...")
    print(f"字段: {', '.join(n for n, _ in FIELDS)}\n")
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            txt = r.read().decode("utf-8", "replace")
            print(f"✅ HTTP {r.status}")
            print("响应:", txt[:300])
            try:
                d = json.loads(txt)
                if d.get("ok"):
                    print("\n表单提交成功。Formspree 已受理这封询盘。")
                    print("接下来请确认：")
                    print("  1) 收件箱（Formspree 后台绑定的邮箱）是否收到")
                    print("  2) 标题是否为 'VEETOP website inquiry'")
            except Exception:
                pass
    except urllib.error.HTTPError as e:
        txt = e.read().decode("utf-8", "replace")
        print(f"❌ HTTP {e.code}")
        print("响应:", txt[:400])
    except Exception as e:
        print(f"❌ {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
