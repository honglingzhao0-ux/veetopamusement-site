#!/usr/bin/env python
"""
配置埋点专用 access key（用于 stats@ 等独立邮箱）。

用法：
    python scripts/set-tracking-key.py <access_key>
    python scripts/set-tracking-key.py --check     # 只看当前状态，不改

说明：
  Web3Forms 的 access_key 绑定收件邮箱 —— 用哪个邮箱注册，邮件就发到哪个邮箱。
  所以埋点 key 必须是**另一个邮箱**（建议 stats@veetopamusement.com）注册的，
  否则埋点邮件还是会落到 sales@，和真询盘混在一起。

  校验规则：
    - 必须与询盘 key（site.config.ts 的 formAccessKey）不同
    - 与询盘 key 相同 → 拒绝写入（那等于没隔离）
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = ROOT / "site.config.ts"

KEY_RE = re.compile(r"^[A-Za-z0-9_-]{16,128}$")


def read_cfg() -> str:
    return CFG.read_text(encoding="utf-8")


def current_keys() -> tuple[str, str]:
    t = read_cfg()
    inquiry = re.search(r'formAccessKey:\s*"([^"]*)"', t)
    tracking = re.search(r'(?:tracking:\s*\{[^}]*?)?accessKey:\s*"([^"]*)"', t, re.S)
    inquiry_key = inquiry.group(1) if inquiry else ""
    tracking_key = tracking.group(1) if tracking else ""
    return inquiry_key, tracking_key


def show() -> None:
    inquiry, tracking = current_keys()
    print("当前配置：")
    print(f"  询盘 key (formAccessKey) : {inquiry or '(空)'}")
    print(f"  埋点 key (tracking)      : {tracking or '(空 —— 埋点停用中)'}")
    print()
    if not tracking:
        print("状态：埋点已停用。询盘通道不受影响，真询盘不会被挤掉。")
        print("      启用方法见下方 usage。")
    elif tracking == inquiry:
        print("⚠️ 状态：埋点与询盘共用同一个 key —— 未真正隔离！")
    else:
        print("状态：埋点与询盘已隔离 ✅")


def write_key(key: str) -> None:
    inquiry, _ = current_keys()
    if not KEY_RE.match(key):
        print(f"❌ key 格式不合法：{key!r}")
        print("   期望 16-128 位字母数字/下划线/连字符")
        sys.exit(1)
    if key == inquiry:
        print("❌ 拒绝写入：该 key 与询盘 key 相同，未起到隔离作用。")
        print("   请用独立邮箱（如 stats@veetopamusement.com）注册后获取 key。")
        sys.exit(1)

    t = read_cfg()
    # 只替换 tracking 段内的 accessKey（tracking 段在 formAccessKey 之后）
    idx = t.find("tracking: {")
    if idx < 0:
        print("❌ 未在 site.config.ts 中找到 tracking 段")
        sys.exit(1)
    head, tail = t[:idx], t[idx:]
    new_tail, n = re.subn(r'(accessKey:\s*)"[^"]*"', rf'\1"{key}"', tail, count=1)
    if n == 0:
        print("❌ 未在 tracking 段中找到 accessKey 字段")
        sys.exit(1)
    CFG.write_text(head + new_tail, encoding="utf-8")
    print(f"✅ 已写入 tracking.accessKey = {key}")
    print("   下一步：跑 publish.sh 发版，或用环境变量 NEXT_PUBLIC_TRACK_ACCESS_KEY 免发版启用。")
    print("   验证：python scripts/set-tracking-key.py --check")


def clear_key() -> None:
    """把埋点 key 清空 —— 埋点回到停用状态（不影响询盘）。"""
    t = read_cfg()
    idx = t.find("tracking: {")
    if idx < 0:
        print("❌ 未在 site.config.ts 中找到 tracking 段")
        sys.exit(1)
    head, tail = t[:idx], t[idx:]
    new_tail, n = re.subn(r'(accessKey:\s*)"[^"]*"', r'\1""', tail, count=1)
    if n == 0:
        print("❌ 未在 tracking 段中找到 accessKey 字段")
        sys.exit(1)
    CFG.write_text(head + new_tail, encoding="utf-8")
    print("✅ 已清空 tracking.accessKey —— 埋点回到停用状态")
    print("   询盘通道不受影响。")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        print("当前状态：")
        show()
        sys.exit(1)
    if sys.argv[1] == "--check":
        show()
        sys.exit(0)
    if sys.argv[1] == "--clear":
        clear_key()
        sys.exit(0)
    write_key(sys.argv[1].strip())
