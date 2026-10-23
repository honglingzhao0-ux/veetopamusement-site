#!/usr/bin/env python
# ============================================================
# 完整 SMTP 投递测试（补完上轮中断的那次）
#
# 上轮失败原因：直接用 smtplib.send_message() 时它会重新 EHLO + MAIL FROM，
# 而阿里企业邮箱在 RCPT TO 之后不接受重复的 MAIL FROM → 503 bad sequence。
# 这次手工走完整会话：EHLO → STARTTLS → MAIL FROM → RCPT TO → DATA → QUIT
#
# 目的：模拟一个海外客户从 Gmail 之类的外部域发信到 Sales@veetopamusement.com
# ============================================================
import smtplib
import ssl
import base64
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

DOMAIN = "veetopamusement.com"
RCPT = "Sales@veetopamusement.com"
FROM = "probe@workbuddy-check.com"     # 外部域，模拟客户
MX = "mx1.qiye.aliyun.com"

print("=" * 70)
print(f"完整 SMTP 会话测试 → {RCPT}  via {MX}")
print("=" * 70)

try:
    s = smtplib.SMTP(MX, 25, timeout=30)
    s.ehlo("client.workbuddy.local")
    print("EHLO ok")

    if s.has_extn("starttls"):
        s.starttls(context=ssl.create_default_context())
        s.ehlo("client.workbuddy.local")
        print("STARTTLS ok（已加密）")

    code, msg = s.mail(FROM)
    print(f"MAIL FROM → {code} {msg.decode(errors='replace')[:70]}")
    if code != 250:
        raise RuntimeError("MAIL FROM 被拒")

    code, msg = s.rcpt(RCPT)
    print(f"RCPT TO   → {code} {msg.decode(errors='replace')[:70]}")
    if code not in (250, 251):
        raise RuntimeError("RCPT TO 被拒")

    body = """Hello VEETOP Sales Team,

This is an automated deliverability test for the veetopamusement.com website
inquiry channel. It was sent from an external domain to confirm that inquiries
sent by overseas customers are accepted and delivered by the mail server.

If you are reading this in your inbox, the email channel is working.

-- automated probe, safe to delete
"""
    m = EmailMessage()
    m["From"] = FROM
    m["To"] = RCPT
    m["Subject"] = "[TEST] Website inquiry channel check - veetopamusement.com"
    m["Date"] = formatdate(localtime=True)
    m["Message-ID"] = make_msgid(domain="workbuddy-check.com")
    m.set_content(body)

    # 手工 DATA，避免 send_message 重发 MAIL FROM
    msgtext = m.as_string()
    code, resp = s.docmd("DATA")
    if code != 354:
        raise RuntimeError(f"DATA 未被接受: {code}")
    # 逐行点号转义
    lines = msgtext.splitlines()
    escaped = "\r\n".join(("." + ln if ln.startswith(".") else ln) for ln in lines)
    s.send(escaped + "\r\n.\r\n")
    code, resp = s.getreply()
    print(f"DATA 投递 → {code} {resp.decode(errors='replace')[:90]}")
    if code == 250:
        print("\n✅ 投递成功 —— 外部域发信到 Sales@ 被服务器接收并投递")
    else:
        print("\n⚠️  服务器未接受投递（常见于未认证的外部发信被策略拦截）")
    s.quit()
except Exception as e:
    print(f"\n❌ {type(e).__name__}: {e}")
