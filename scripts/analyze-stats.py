#!/usr/bin/env python
# ============================================================
# 首页主推排名分析（配合全站埋点使用）
#
# 埋点数据投递到 Formspree（subject 以 "STAT:" 开头），导出 CSV 后：
#   1. 打开 Formspree 后台 → Inbox → 只选 subject 以 STAT: 开头的邮件
#   2. 导出为 CSV，放到本目录
#   3. 运行：python scripts/analyze-stats.py stats.csv
#   4. 按输出的排名改 scripts/set-featured-rank.py 里的 RANK，重跑即可
#
# 评分口径：
#   click   （卡片点击） 权重 1.0   —— 吸引力
#   view    （详情页浏览）权重 2.0   —— 看完仍想进一步
#   inquiry （询盘提交）  权重 10.0 —— 真实商业转化，最重
# ============================================================
import csv, sys
from collections import defaultdict

WEIGHT = {"click": 1.0, "view": 2.0, "inquiry": 10.0}

def analyze(path):
    stats = defaultdict(lambda: defaultdict(int))
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            print("❌ CSV 没有表头，无法解析")
            return
        # 兼容不同导出列名
        ev_col = next((c for c in reader.fieldnames
                       if c.lower() in ("event", "_subject", "subject")), None)
        m_col = next((c for c in reader.fieldnames
                      if c.lower() in ("model", "value")), None)
        if not m_col:
            print("❌ 找不到 model 列。可用列：", reader.fieldnames)
            return
        for row in reader:
            model = (row.get(m_col) or "").strip()
            raw = (row.get(ev_col) or "") if ev_col else ""
            ev = ""
            for k in WEIGHT:
                if k in raw.lower():
                    ev = k
                    break
            if not ev:
                continue
            if ev == "view":
                # view 传的是 slug，转成型号不可行，跳过（click/inquiry 用型号）
                continue
            stats[model][ev] += 1

    if not stats:
        print("没有解析到有效统计事件。检查 CSV 是否为 Formspree 导出的 STAT: 邮件。")
        return

    rows = []
    for model, d in stats.items():
        c = d.get("click", 0); i = d.get("inquiry", 0)
        score = c * WEIGHT["click"] + i * WEIGHT["inquiry"]
        rows.append((score, model, c, i))
    rows.sort(reverse=True)

    print(f"{'排名':<6}{'型号':<14}{'点击':<8}{'询盘':<8}{'加权分':<8}")
    print("-" * 44)
    for n, (score, model, c, i) in enumerate(rows, 1):
        print(f"{n:<6}{model:<14}{c:<8}{i:<8}{score:.0f}")

    print()
    print("用法：把上面排名靠前的型号填入 scripts/set-featured-rank.py 的 RANK，")
    print("     品类要均衡的话，每品类至少保留 1 款（claw-crane / prize / kiddie 最易被漏）。")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    analyze(sys.argv[1])