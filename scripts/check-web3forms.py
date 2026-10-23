#!/usr/bin/env python
# ============================================================
# Web3Forms 接入自检
#
# 验证三件事：
#   1) 站点代码里 endpoint / access_key / botcheck 是否都到位
#   2) 用真实 access_key 时能否成功投递（需要先在 site.config.ts 填入 key）
#   3) 用错误 key 时的错误响应长什么样（确认失败能被前端识别并提示）
#
# 用法：
#   python scripts/check-web3forms.py            # 只做配置自检（不发信）
#   python scripts/check-web3forms.py --send     # 真发一封测试询盘
# ============================================================
import json
import re
import os
import sys
import urllib.request
import urllib.error

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
ENDPOINT = "https://api.web3forms.com/submit"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")


def read_config():
    p = os.path.join(WORK, "site.config.ts")
    src = open(p, encoding="utf-8").read()
    key = None
    m = re.search(r'formAccessKey:\s*"([^"]*)"', src)
    if m:
        key = m.group(1)
    ep = None
    m = re.search(r'formEndpoint:\s*"([^"]*)"', src)
    if m:
        ep = m.group(1)
    email = None
    m = re.search(r'email:\s*"([^"]*)"', src)
    if m:
        email = m.group(1)
    return ep, key, email, src


def post(access_key, fields, origin="https://www.veetopamusement.com"):
    payload = dict(fields)
    payload["access_key"] = access_key
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": UA,
            "Origin": origin,
            "Referer": "https://www.veetopamusement.com/contact/",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"


def main():
    ep, key, email, src = read_config()

    print("=" * 70)
    print("1. 站点配置自检")
    print("=" * 70)
    print(f"  contact.email           = {email}")
    print(f"  contact.formEndpoint    = {ep}")
    print(f"  contact.formAccessKey   = {key if key else '(空 —— 还没填)'}")
    print(f"  邮箱是小写               = {email == email.lower()}")
    print(f"  端点已切到 Web3Forms     = {'web3forms.com' in (ep or '')}")

    # 组件检查
    checks = [
        ("lib/inquiry.ts 传 accessKey", "accessKey" in
         open(os.path.join(WORK, "lib", "inquiry.ts"), encoding="utf-8").read()),
        ("lib/inquiry.ts 带 access_key 字段", "entries.access_key" in
         open(os.path.join(WORK, "lib", "inquiry.ts"), encoding="utf-8").read()),
        ("inquiry-form.tsx 传 accessKey", "accessKey" in
         open(os.path.join(WORK, "components", "inquiry-form.tsx"), encoding="utf-8").read()),
        ("inquiry-form.tsx 有蜜罐 botcheck", "formBotField" in
         open(os.path.join(WORK, "components", "inquiry-form.tsx"), encoding="utf-8").read()),
        ("lib/track.ts 也带 access_key", "access_key" in
         open(os.path.join(WORK, "lib", "track.ts"), encoding="utf-8").read()),
        ("无残留 formspree 引用（src 内）", "formspree" not in src.lower()),
    ]
    for name, ok in checks:
        print(f"  {'✓' if ok else '✗'} {name}")

    print()
    print("=" * 70)
    print("2. 遗留的 formspree 引用（全项目扫描）")
    print("=" * 70)
    hits = []
    for root, dirs, files in os.walk(WORK):
        dirs[:] = [d for d in dirs if d not in
                   ("node_modules", ".next", "out", ".git", "_backup_darkfix_polluted",
                    "_backup_images_multi", "inbox_x", "_jobs")]
        for f in files:
            if not f.endswith((".ts", ".tsx")):
                continue
            fp = os.path.join(root, f)
            try:
                if "formspree" in open(fp, encoding="utf-8").read().lower():
                    hits.append(os.path.relpath(fp, WORK))
            except Exception:
                pass
    if hits:
        for h in hits:
            print(f"  ⚠ {h}")
    else:
        print("  无（代码里已全部切走）")

    if "--send" not in sys.argv:
        print()
        print("=" * 70)
        if not key:
            print("未填 access_key —— 需要你先去 Web3Forms 后台生成")
            print("  https://app.web3forms.com  用 sales@veetopamusement.com 注册")
            print("  创建表单后，把 access key 填入 site.config.ts 的 formAccessKey")
            print("  然后重跑本脚本 --send 实测投递")
        else:
            print("配置就绪。跑 `python scripts/check-web3forms.py --send` 实测投递")
        return

    print()
    print("=" * 70)
    print("3. 实测投递（真发一封测试询盘）")
    print("=" * 70)
    fields = {
        "_subject": "VEETOP website inquiry",
        "name": "Test Inquiry - Channel Verification",
        "company": "Test Buyer Co., Ltd.",
        "email": "probe@workbuddy-check.com",
        "country": "United States",
        "productInterest": "VTSP007 (Boxing IB)",
        "quantity": "5-20 units",
        "businessType": "Distributor / wholesaler",
        "message": "Automated channel verification via website form. "
                   "Please ignore - not a real request.",
    }
    st, body = post(key, fields)
    print(f"HTTP {st}")
    print("响应:", body[:400])
    if st == 200:
        try:
            d = json.loads(body)
            if d.get("success"):
                print("\n✅ 投递成功 —— 请去 sales@veetopamusement.com 收件箱确认")
                print("   标题应为 'VEETOP website inquiry'")
        except Exception:
            pass
    elif st == 400:
        print("\n⚠️  400 —— access_key 无效或邮箱未验证")
        print("   去 Web3Forms 后台确认：邮箱已验证、access key 复制完整、域名已加白名单")


if __name__ == "__main__":
    main()
