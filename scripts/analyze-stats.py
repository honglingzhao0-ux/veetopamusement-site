#!/usr/bin/env python
# ============================================================
# 首页主推排名分析（配合全站埋点使用）
#
# 埋点数据投递到 Web3Forms（subject 以 "STAT:" 开头），导出 CSV 后：
#   1. 打开 app.web3forms.com → Inbox → 只选 subject 以 STAT: 开头的邮件
#   2. 导出为 CSV，放到本目录
#   3. 运行：python scripts/analyze-stats.py stats.csv
#   4. 按输出的排名改 scripts/set-featured-rank.py 里的 RANK，重跑即可
#
# ⚠️ 两种邮件格式都要能解析（2026-10-31 起埋点改为批量打包）：
#   A. 单条（旧）  subject = "STAT: click | VTABC001"     有 event / model 列
#   B. 批量（新）  subject = "STAT: batch | 5 event(s)"   有 events 列（JSON 数组）
#      批量邮件里 event=batch，model 是逗号拼接的型号串，
#      明细在 events 字段的 JSON 里 → 必须解析 events 才不会漏数据。
#
# 评分口径：
#   click   （卡片点击） 权重 1.0   —— 吸引力
#   view    （详情页浏览）权重 2.0   —— 看完仍想进一步
#   inquiry （询盘提交）  权重 10.0 —— 真实商业转化，最重
#
# 注：2026-10-31 起 inquiry 事件不再单独上报（避免双倍消耗额度），
#     真询盘本身会进 Web3Forms 收件箱，可直接人工核对。
# ============================================================
import csv
import json
import sys
from collections import defaultdict

WEIGHT = {"click": 1.0, "view": 2.0, "inquiry": 10.0}


def parse_events_json(raw):
    """解析批量邮件的 events 字段（JSON 数组）→ [(event, model), ...]"""
    if not raw:
        return []
    raw = raw.strip()
    try:
        arr = json.loads(raw)
    except (ValueError, TypeError):
        return []
    if not isinstance(arr, list):
        return []
    out = []
    for item in arr:
        if not isinstance(item, dict):
            continue
        ev = str(item.get("event", "")).strip().lower()
        model = str(item.get("model", "")).strip()
        if ev in WEIGHT and model:
            out.append((ev, model))
    return out


def detect_event(raw_subject):
    """从 subject 文本里识别事件类型"""
    low = (raw_subject or "").lower()
    for k in WEIGHT:
        if k in low:
            return k
    return ""


def analyze(path):
    stats = defaultdict(lambda: defaultdict(int))
    batch_mails = 0
    single_mails = 0

    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            print("❌ CSV 没有表头，无法解析")
            return
        fields = reader.fieldnames
        # 兼容不同导出列名
        ev_col = next((c for c in fields
                       if c.lower() in ("event", "_subject", "subject")), None)
        m_col = next((c for c in fields
                      if c.lower() in ("model", "value")), None)
        events_col = next((c for c in fields if c.lower() == "events"), None)

        if not m_col and not events_col:
            print("❌ 找不到 model / events 列。可用列：", fields)
            return

        for row in reader:
            # --- 优先走批量格式（events 字段有数据）---
            if events_col:
                pairs = parse_events_json(row.get(events_col) or "")
                if pairs:
                    batch_mails += 1
                    for ev, model in pairs:
                        stats[model][ev] += 1
                    continue

            # --- 单条格式 ---
            raw_subject = (row.get(ev_col) or "") if ev_col else ""
            ev = detect_event(raw_subject)
            if not ev or not m_col:
                continue
            model = (row.get(m_col) or "").strip()
            if not model:
                continue
            single_mails += 1
            stats[model][ev] += 1

    if not stats:
        print("没有解析到有效统计事件。检查 CSV 是否为 Web3Forms 导出的 STAT: 邮件。")
        return

    rows = []
    for model, d in stats.items():
        c = d.get("click", 0)
        v = d.get("view", 0)
        i = d.get("inquiry", 0)
        score = c * WEIGHT["click"] + v * WEIGHT["view"] + i * WEIGHT["inquiry"]
        rows.append((score, model, c, v, i))
    rows.sort(reverse=True)

    print(f"解析到 {batch_mails} 封批量邮件 + {single_mails} 封单条邮件")
    print()
    print(f"{'排名':<6}{'型号':<26}{'点击':<8}{'浏览':<8}{'询盘':<8}{'加权分':<8}")
    print("-" * 64)
    for n, (score, model, c, v, i) in enumerate(rows, 1):
        print(f"{n:<6}{model:<26}{c:<8}{v:<8}{i:<8}{score:.0f}")

    print()
    print("用法：把上面排名靠前的型号填入 scripts/set-featured-rank.py 的 RANK，")
    print("     品类要均衡的话，每品类至少保留 1 款（claw-crane / prize / kiddie 最易被漏）。")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    analyze(sys.argv[1])
