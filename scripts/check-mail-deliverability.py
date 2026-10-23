#!/usr/bin/env python
# ============================================================
# 实测：客户从外部发邮件到 Sales@veetopamusement.com 能否投递
#
# 测两件事：
#   1) 收件地址是否存在（SMTP RCPT TO 阶段会 550/551 拒收不存在的用户）
#   2) 走完整投递（MAIL FROM → RCPT TO → DATA）
#
# 注意：不设密码，只做 RCPT 探测 + 尽力投递。
#      阿里企业邮箱对未认证的外部发信通常会拒收或进垃圾箱，这属正常。
# ============================================================
import smtplib
import socket
import time
from email.message import EmailMessage

DOMAIN = "veetopamusement.com"
RCPT = "Sales@veetopamusement.com"
FROM = "probe@workbuddy-check.com"   # 外部域，模拟客户
MX = "mx1.qiye.aliyun.com"

print("=" * 66)
print(f"探测目标: {RCPT}  via {MX}")
print("=" * 66)

try:
    s = smtplib.SMTP(MX, 25, timeout=25)
    s.set_debuglevel(0)
    code, msg = s.ehlo("probe.local")
    print(f"EHLO → {code} {msg.decode(errors='replace')[:120]}")

    code, msg = s.mail(FROM)
    print(f"MAIL FROM:{FROM} → {code} {msg.decode(errors='replace')[:80]}")

    code, msg = s.rcpt(RCPT)
    rcpt_code = code
    print(f"RCPT TO:{RCPT} → {code} {msg.decode(errors='replace')[:120]}")

    if 200 <= code < 300:
        print("\n✅ 收件人地址存在，SMTP 服务器接受了投递请求")
        print("   → 客户发到 Sales@veetopamusement.com 会被服务器接收")
        body = (f"Test inquiry from external sender.\n"
                f"Checking if {RCPT} is deliverable.\n")
        msg2 = EmailMessage()
        msg2["From"] = FROM
        msg2["To"] = RCPT
        msg2["Subject"] = "Deliverability test - VEETOP site inquiry channel"
        msg2.set_content(body)
        try:
            s.send_message(msg2)
            print("   已提交投递（DATA 阶段成功）")
        except Exception as e:
            print(f"   DATA 阶段: {type(e).__name__}: {e}")
            print("   （未认证的外部发信常被拒收，属正常现象）")
    else:
        print("\n❌ 收件人被拒 —— 该地址可能不存在或被策略拦截")
    s.quit()
except Exception as e:
    print(f"连接失败: {type(e).__name__}: {e}")
    print("（可能本机出网被代理限制）")

# 顺带确认 DNS 里没有奇奇怪怪的记录
print("\n--- DNS 补充检查 ---")
import subprocess
for rtype in ("MX", "TXT"):
    try:
        out = subprocess.run(["nslookup", "-type=" + rtype, DOMAIN],
                             capture_output=True, text=True, timeout=20).stdout
        for line in out.splitlines():
            if "mail exchanger" in line or "v=spf1" in line:
                print("  ", line.strip())
    except Exception:
        pass
