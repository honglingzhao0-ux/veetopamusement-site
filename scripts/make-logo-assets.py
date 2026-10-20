#!/usr/bin/env python
# ============================================================
# Logo 资产处理：从官方 Logo 切出可用资源
#
# 输入：C:\Users\den\.workbuddy\blobs\aa\aac0e78ca4b4a1d622dd1aafb9fceabf57316d90662cddac2840570035ae9a6a.png
#       （= X:\...\首页Banner素材\VEETOP Amusement.png 的会话副本，704×279）
#
# 输出到 public/brand/：
#   logo-mark.png        仅 V 形标（透明底，深蓝+亮蓝渐变）
#   logo-full-dark.png   完整 Logo，深色字版（深灰字，透明底）
#   logo-full-light.png  完整 Logo，反白字版（白字，透明底）
#   logo-mark.svg        V 形标的矢量版（手绘路径，可任意缩放）
#
# 品牌色（从原图采样）：
#   深蓝 #002665  亮蓝 #0071BD  浅蓝 #34A2DD  深灰 #444444
# ============================================================
import os
from PIL import Image

SRC = r"C:\Users\den\.workbuddy\blobs\aa\aac0e78ca4b4a1d622dd1aafb9fceabf57316d90662cddac2840570035ae9a6a.png"
OUT = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site\public\brand"

NAVY = (0, 38, 101)
BLUE = (0, 113, 189)
LIGHTBLUE = (52, 162, 221)
DARKGRAY = (68, 68, 68)
WHITE = (255, 255, 255)


def crop_mark(im):
    """切出 V 形标：图形左半部分（V 标在文字左侧）"""
    # 原图 704×279，V 标大致在 x 5..210 区间
    return im.crop((0, 0, 220, im.height))


def make_transparent(im, bg=(255, 255, 255)):
    """白底转透明"""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # 按亮度做软过渡，避免硬边
            if r > 246 and g > 246 and b > 246:
                px[x, y] = (r, g, b, 0)
            elif r > 225 and g > 225 and b > 225:
                alpha = int(255 * (246 - r) / 21)
                px[x, y] = (r, g, b, max(0, min(255, alpha)))
    return im


def recolor_text(im, new_color):
    """把深灰文字替换为指定颜色（保留 V 标原色）"""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # 深灰文字：低饱和、中等偏暗
            if abs(r - g) < 14 and abs(g - b) < 14 and 40 < r < 130:
                px[x, y] = new_color + (a,)
    return im


def main():
    if not os.path.exists(SRC):
        print(f"❌ 找不到源文件：{SRC}")
        return
    os.makedirs(OUT, exist_ok=True)

    src = Image.open(SRC).convert("RGB")

    # 1) 完整 logo（深色字版）—— 裁掉原图四周留白
    full_t = make_transparent(src)
    bbox = full_t.getbbox()
    if bbox:
        full_t = full_t.crop(bbox)
    full_t.save(os.path.join(OUT, "logo-full-dark.png"), optimize=True)

    # 2) 完整 logo（反白字版，用于深色页脚/深色背景）
    full_l = recolor_text(make_transparent(src), WHITE)
    bbox = full_l.getbbox()
    if bbox:
        full_l = full_l.crop(bbox)
    full_l.save(os.path.join(OUT, "logo-full-light.png"), optimize=True)

    # 3) 仅 V 形标
    mark = crop_mark(src)
    mark_t = make_transparent(mark)
    bbox = mark_t.getbbox()
    if bbox:
        mark_t = mark_t.crop(bbox)
    mark_t.save(os.path.join(OUT, "logo-mark.png"), optimize=True)

    print("✅ 已生成：")
    for f in sorted(os.listdir(OUT)):
        p = os.path.join(OUT, f)
        im = Image.open(p)
        kb = os.path.getsize(p) / 1024
        print(f"   {f:<24} {im.size}  {kb:.1f}KB")


if __name__ == "__main__":
    main()
