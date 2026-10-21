#!/usr/bin/env python
# ============================================================
# Logo 换色：蓝色版 → 橙色版
#
# 输入：public/brand/logo-full-dark.png（深色字版，透明底）
# 输出：public/brand/logo-full-dark-orange.png
#       public/brand/logo-full-light-orange.png
#       public/brand/logo-mark-orange.png
#
# 换色原理（不是简单替换颜色，而是保住渐变结构）：
#   1. 用 HSL 分离：文字是中性灰（饱和度 <0.2），V 标是蓝色（色相 200-230）
#   2. 蓝色像素：色相旋转到橙色区间（约 24 度），并按原亮度重新映射
#      —— 直接转 HSL 会让深蓝变暗、浅蓝变亮，层次错乱
#   3. 用「亮度保持 + 轻微提亮」策略：深蓝 → 深橙，亮蓝 → 亮橙
#   4. 文字灰色保持不变（官方 Logo 的字是深灰，换色只针对图形部分）
#
# 目标色（取自站点 accent 体系）：
#   主橙 #ff6a00   深橙 #d94f00   亮橙 #ff8c3d
# ============================================================
import os
import colorsys
from PIL import Image

BASE = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site\public\brand"

# 目标橙色（HSL）
TARGET_HUE = 24.0 / 360.0  # 橙色
# 蓝色原色相范围 200-230 → 目标 24 度（相当于旋转 +154 度）


def blue_to_orange(r, g, b):
    """蓝色像素 → 橙色像素，保留渐变层次"""
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    hue_deg = h * 360

    # 新色相：把 200-230 区间映射到 20-32 区间（保留一点冷暖变化）
    t = (hue_deg - 200) / 30.0
    t = max(0.0, min(1.0, t))
    new_hue = ((20.0 + t * 12.0) / 360.0) % 1.0

    # 饱和度：原蓝饱和度接近 1，橙色也保持高饱和
    new_s = min(1.0, s * 1.12)

    # 亮度重映射（关键）：
    #   原图深蓝 L≈0.20 占比很大，直接换算会得到大量暗棕（#5c2600），
    #   视觉上发闷、也不像品牌橙。
    #   策略：把亮度整体抬到橙色系的舒适区（0.34 ~ 0.72），
    #   保留原有的相对明暗关系（深色端仍然最暗，浅色端仍最亮）。
    if l < 0.28:
        new_l = 0.335 + (l / 0.28) * 0.055   # 最深蓝 → 深橙 0.335~0.39
    elif l < 0.42:
        new_l = 0.39 + ((l - 0.28) / 0.14) * 0.13  # 中蓝 → 中橙 0.39~0.52
    else:
        new_l = 0.52 + min(1.0, (l - 0.42) / 0.25) * 0.19  # 浅蓝 → 亮橙 0.52~0.71

    nr, ng, nb = colorsys.hls_to_rgb(new_hue, new_l, new_s)
    return (int(nr * 255), int(ng * 255), int(nb * 255))


def convert(src_path, dst_path, text_color=None):
    """转换：蓝色→橙色，文字可选改为指定色"""
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
                px[x, y] = blue_to_orange(r, g, b) + (a,)
                changed += 1
    im.save(dst_path, optimize=True)
    return changed, im.size


def main():
    dark_src = os.path.join(BASE, "logo-full-dark.png")
    if not os.path.exists(dark_src):
        print(f"❌ 找不到源文件：{dark_src}")
        return

    # 1) 深色字版（文字保持深灰 #444444）
    n1, s1 = convert(dark_src, os.path.join(BASE, "logo-full-dark-orange.png"))
    print(f"✅ logo-full-dark-orange.png   {s1}  换色 {n1}px")

    # 2) 反白字版（文字白）
    n2, s2 = convert(dark_src, os.path.join(BASE, "logo-full-light-orange.png"),
                     text_color=(255, 255, 255))
    print(f"✅ logo-full-light-orange.png  {s2}  换色 {n2}px")

    # 3) 仅 V 标
    mark_src = os.path.join(BASE, "logo-mark.png")
    if os.path.exists(mark_src):
        n3, s3 = convert(mark_src, os.path.join(BASE, "logo-mark-orange.png"))
        print(f"✅ logo-mark-orange.png        {s3}  换色 {n3}px")

    # 采样输出主色供确认
    im = Image.open(os.path.join(BASE, "logo-full-dark-orange.png")).convert("RGBA")
    px = im.load()
    from collections import Counter
    cnt = Counter()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if max(r, g, b) - min(r, g, b) > 30:
                cnt[(r, g, b)] += 1
    print()
    print("橙色主色 TOP 6:")
    for c, k in cnt.most_common(6):
        print(f"   #{c[0]:02x}{c[1]:02x}{c[2]:02x}   n={k}")


if __name__ == "__main__":
    main()
