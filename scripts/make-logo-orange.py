#!/usr/bin/env python
# ============================================================
# Logo 换色：蓝色版 → 橙色 / 火焰橙
#
# 输入：public/brand/logo-full-dark.png（深色字版，透明底）
# 输出：
#   logo-full-dark-orange.png    / logo-full-light-orange.png    （标准橙）
#   logo-full-dark-flame.png    / logo-full-light-flame.png    （火焰橙）
#   logo-mark-orange.png        / logo-mark-flame.png
#
# 换色原理（不是简单替换颜色，而是保住渐变结构）：
#   1. 用 HSL 分离：文字是中性灰（饱和度 <0.2），V 标是蓝色（色相 200-230）
#   2. 蓝色像素：色相旋转到目标色相区间，并按原亮度重新映射
#      —— 直接转 HSL 会让深蓝变暗、浅蓝变亮，层次错乱
#   3. 用「亮度分段重映射」：深蓝 → 深色端，浅蓝 → 亮色端，
#      保留原有的相对明暗关系
#   4. 文字灰色保持不变（官方 Logo 的字是深灰，换色只针对图形部分）
#
# 目标色：
#   标准橙  主色 #f15700（H≈21.7°），与站点 accent #ff6a00 对齐
#   火焰橙  主色 #ff4500（H≈16.2°，OrangeRed），更偏红更饱和
# ============================================================
import os
import colorsys
from collections import Counter
from PIL import Image

BASE = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site\public\brand"

# 目标色板：每个变体定义色相区间、饱和度系数、亮度分段
VARIANTS = {
    "orange": {
        # 标准橙：H 20~32°，饱和度 ×1.12
        "hue_range": (20.0, 32.0),
        "sat_mult": 1.12,
        "lum_bands": [
            (0.28, 0.335, 0.390),   # 最深蓝 → 深橙
            (0.42, 0.390, 0.520),   # 中蓝   → 中橙
            (0.42, 0.520, 0.710),   # 浅蓝   → 亮橙
        ],
        "lum_top": 0.71,
    },
    "flame": {
        # 火焰橙：H 11~21°（比标准橙更偏红，接近 OrangeRed #ff4500）
        # 饱和度拉满 —— 火焰感来自高饱和 + 偏红
        "hue_range": (11.0, 21.0),
        "sat_mult": 1.22,
        "lum_bands": [
            (0.28, 0.300, 0.360),   # 最深蓝 → 深焰（暗红橙）
            (0.42, 0.360, 0.500),   # 中蓝   → 火焰橙
            (0.42, 0.500, 0.700),   # 浅蓝   → 亮焰
        ],
        "lum_top": 0.70,
    },
}


def blue_to_target(r, g, b, cfg):
    """蓝色像素 → 目标色像素，保留渐变层次"""
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    hue_deg = h * 360

    # 色相映射：原蓝 200-230° → 目标区间
    h0, h1 = cfg["hue_range"]
    t = max(0.0, min(1.0, (hue_deg - 200) / 30.0))
    new_hue = ((h0 + t * (h1 - h0)) / 360.0) % 1.0

    # 饱和度：原蓝接近 1，橙系保持高饱和（火焰橙拉得更满）
    new_s = min(1.0, s * cfg["sat_mult"])

    # 亮度分段重映射（关键）：
    #   原图深蓝 L≈0.20 占比很大，直接按原亮度换算会得到大量暗棕
    #   （发闷、不像品牌橙）。这里把亮度整体抬到目标色系的舒适区，
    #   同时保留原有的相对明暗关系。
    new_l = l
    for limit, lo, hi in cfg["lum_bands"]:
        if l < limit:
            span = (limit - 0.28) if limit > 0.28 else 0.14
            new_l = lo + ((l - 0.28) / span if span else 0) * (hi - lo)
            break
    else:
        new_l = cfg["lum_bands"][-1][1] + (
            min(1.0, (l - 0.42) / 0.25) * (cfg["lum_bands"][-1][2] - cfg["lum_bands"][-1][1])
        )
    new_l = max(0.0, min(cfg["lum_top"], new_l))

    nr, ng, nb = colorsys.hls_to_rgb(new_hue, new_l, new_s)
    return (int(nr * 255), int(ng * 255), int(nb * 255))


def convert(src_path, dst_path, cfg, text_color=None):
    """转换：蓝色→目标色，文字可选改为指定色"""
    im = Image.open(src_path).convert("RGBA")
    px = im.load()
    w, h = im.size
    changed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # 中性灰 = 文字，保持原样（或替换为 text_color）
            if abs(r - g) < 16 and abs(g - b) < 16 and abs(r - b) < 16:
                if text_color is not None:
                    px[x, y] = text_color + (a,)
                continue
            # 有色像素 = V 标
            if max(r, g, b) - min(r, g, b) > 12:
                px[x, y] = blue_to_target(r, g, b, cfg) + (a,)
                changed += 1
    im.save(dst_path, optimize=True)
    return changed, im.size


def main():
    dark_src = os.path.join(BASE, "logo-full-dark.png")
    mark_src = os.path.join(BASE, "logo-mark.png")
    if not os.path.exists(dark_src):
        print(f"❌ 找不到源文件：{dark_src}")
        return

    for name, cfg in VARIANTS.items():
        # 深色字版（文字保持深灰 #444444）
        n1, s1 = convert(dark_src, os.path.join(BASE, f"logo-full-dark-{name}.png"), cfg)
        # 反白字版（文字白）
        n2, s2 = convert(dark_src, os.path.join(BASE, f"logo-full-light-{name}.png"),
                         cfg, text_color=(255, 255, 255))
        print(f"✅ logo-full-dark-{name}.png / logo-full-light-{name}.png  {s1}  换色 {n1}px")

        if os.path.exists(mark_src):
            n3, s3 = convert(mark_src, os.path.join(BASE, f"logo-mark-{name}.png"), cfg)
            print(f"✅ logo-mark-{name}.png  {s3}  换色 {n3}px")

        # 采样输出主色供确认
        im = Image.open(os.path.join(BASE, f"logo-full-dark-{name}.png")).convert("RGBA")
        px = im.load()
        cnt = Counter()
        for y in range(im.size[1]):
            for x in range(im.size[0]):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                if max(r, g, b) - min(r, g, b) > 30:
                    cnt[(r, g, b)] += 1
        print(f"   主色 TOP 4: " + "  ".join(
            f"#{c[0]:02x}{c[1]:02x}{c[2]:02x}({k})" for c, k in cnt.most_common(4)))
        print()


if __name__ == "__main__":
    main()
