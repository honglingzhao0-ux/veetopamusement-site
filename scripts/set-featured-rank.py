#!/usr/bin/env python
# ============================================================
# 为首页 Flagship Models 设定主推排名（featuredRank）
# 选品原则：品类均衡（6 品类全覆盖）+ 出口热销品类优先 + 视觉代表性
# 排名 1 = 首页第一位。改排名只需改这里的 rank，重跑脚本即可。
# ============================================================
import json, os, io

# slug -> featuredRank（1 起，按此顺序即为首页展示顺序）
RANK = {
    # --- 街机 / 竞速类（出口最热销，视觉冲击强）---
    "vtra010-10-supreme-arcade-twins": 1,
    "vtsa013-dynamic-moto-3-dx": 2,
    "vtsa014-dynamic-moto-5-dx": 3,
    "vtra017-32-arcade-game-wooden-cabinet": 4,

    # --- 体育竞技类 ---
    "vtsa010-2-player-magic-hockey": 5,
    "vtsa013-2-player-air-hockey": 6,

    # --- 彩票/兑换类 ---
    "vttr074-55-flappy-bird-hd": 7,
    "vttr085-coin-pusher-1p": 8,

    # --- 抓娃娃机（礼品机是 FEC 主力）---
    "vtpg016-4p-mini-crane-machine-a": 9,
    "vtpg017-4p-mini-crane-machine-b": 10,
    "vtpg018-4p-mini-crane-machine-c": 11,

    # --- 礼品机/扭蛋 ---
    "vttr086-happy-castle": 12,
    "vtpg029-key-master": 13,

    # --- 儿童骑乘（FEC/商场刚需）---
    "vtkr107-3d-horse": 14,
    "vtkr108-3d-car": 15,
    "vtkr110-luxury-carousel-3p": 16,
}

D = "data/products"
hit = 0
miss = []
for slug, rank in sorted(RANK.items(), key=lambda x: x[1]):
    p = os.path.join(D, f"{slug}.json")
    if not os.path.exists(p):
        miss.append(slug)
        continue
    raw = io.open(p, encoding="utf-8").read()
    data = json.loads(raw)
    data["featuredRank"] = rank
    # 保留原有缩进风格：2 空格 + 末尾换行
    io.open(p, "w", encoding="utf-8").write(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    )
    hit += 1

print(f"已写入 featuredRank：{hit}/{len(RANK)} 个产品")
if miss:
    print("⚠️ 未找到（slug 不存在）：")
    for m in miss:
        print("   -", m)