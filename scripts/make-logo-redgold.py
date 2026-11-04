#!/usr/bin/env python
# ============================================================
# Logo 资产处理：官方红金版 VEETOP Logo
#
# 输入：用户提供的官方 Logo（1036×386，红金 V 标 + 深蓝衬线 VEETOP 字标）
# 输出到 public/brand/：
#   logo-full-dark.png    完整 Logo，深色字版（浅色背景用）—— 透明底
#   logo-full-light.png   完整 Logo，反白字版（深色页脚用）—— 透明底
#   logo-mark.png         仅 V 形标 —— 透明底
#
# 处理要点：
#   ① 去白底：原图背景是近白冷灰 (250,251,252)，用亮度阈值做软过渡
#   ② 反白版：只把深蓝文字换成白，V 标的红/金保持原色
#      （金色在深色页脚 #0f172a 上需要提亮才够清晰）
#   ③ 裁切：去掉四周留白，按内容包围盒裁
#
# 品牌色（从原图采样）：
#   深蓝文字 #000024 ~ #002454（带渐变与高光）
#   红色 V 标 #500000 ~ #9c0c0c（深红渐变）
#   金色 V 标 #f0f0e4（亮部偏淡，带描边）
# ============================================================
import os

from PIL import Image

ROOT = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
SRC = os.path.join(ROOT, "public", "brand", "_logo-src-redgold.png")
OUT = os.path.join(ROOT, "public", "brand")

WHITE = (255, 255, 255)


def make_transparent(im, keep_soft_edge=False):
    """
    近白冷灰背景转透明（带软过渡，避免硬边锯齿）

    ⚠️ 背景亮度实测分布（min(r,g,b)）：
         240-259 占 80 万像素（噪点 246~252 之间跳动）
         ≤230 才是真正的内容
       所以「完全透明」阈值取 244，240-243 作过渡带。
       若取 249，只有一半背景被清掉 → 裁切 bbox 覆盖全图。

    keep_soft_edge=True 时保留边缘的半透明像素（用于反白版：
    边缘若直接改成白色会在深色背景上形成白色 halo）。
    """
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            mn = min(r, g, b)
            if mn >= 244:
                px[x, y] = (r, g, b, 0)
            elif mn >= 236:
                alpha = int(255 * (244 - mn) / 8)
                px[x, y] = (r, g, b, max(0, min(255, alpha)))
            elif mn >= 226:
                if keep_soft_edge:
                    # 保留但压低：反白时这类像素原本是文字的抗锯齿边
                    px[x, y] = (r, g, b, max(0, min(255, alpha)))
                else:
                    alpha = int(255 * (236 - mn) / 10 * 0.5)
                    px[x, y] = (r, g, b, max(0, min(255, alpha)))
    return im


def recolor_wordmark(im, new_rgb, brighten_gold=0, split_x=None):
    """
    把字标整体替换为纯色（用于反白版），V 标的红/金保持原样。

    ⚠️ 踩过的坑（都实测过）：
       ① 逐像素"挑深蓝改白"→ 留下原字标的白色高光边，深底上出现脏光晕。
       ② 按颜色判定"哪些是 V 标"→ 原字标自带深蓝描边，
          描边被当成字标换成白，而字标里残留的深蓝描边在深底上形成暗边。
       ③ 高光保护过宽→ 白色背景像素被误判成 V 标。

    正确做法：**按 x 坐标硬切**——
       V 标在左（x < split_x），字标在右（x >= split_x），互不干扰。
       切缝取在两者之间的空白处（实测 340~364 之间都是背景）。
    """
    if split_x is None:
        split_x = int(im.width * 0.33)

    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue

            if x < split_x:
                # ---- V 标区：红/金保持原样，金色可提亮 ----
                if brighten_gold and r > 140 and g > 95 and b < 210 and (r - b) > 40:
                    nr = min(255, int(r * 1.16) + 22)
                    ng = min(255, int(g * 1.16) + 16)
                    nb = min(255, int(b * 1.06) + 8)
                    px[x, y] = (nr, ng, nb, a)
                continue

            # ---- 字标区：整段换成纯白（含高光、描边、抗锯齿）----
            px[x, y] = new_rgb + (a,)
    return im


def crop_to_content(im, thresh=20):
    """
    按 alpha 包围盒裁掉留白。

    ⚠️ 背景有极淡噪点（246~252 不等），只把 >=249 判为透明会留下
    大量 alpha>0 的噪点像素，导致 bbox 覆盖整张图。
    这里用**行/列剖面法**：统计每行/列中"足够不透明"的像素数，
    连续只有少量像素的行/列视为留白。
    """
    a = im.getchannel("A")
    w, h = im.size
    pa = a.load()

    def row_score(y):
        return sum(1 for x in range(w) if pa[x, y] >= thresh)

    def col_score(x):
        return sum(1 for y in range(h) if pa[x, y] >= thresh)

    rows = [row_score(y) for y in range(h)]
    cols = [col_score(x) for x in range(w)]
    # 阈值：该行/列至少要有 0.5% 的像素是不透明的，才算内容
    r_thr = max(2, int(w * 0.005))
    c_thr = max(2, int(h * 0.005))
    ys = [y for y in range(h) if rows[y] >= r_thr]
    xs = [x for x in range(w) if cols[x] >= c_thr]
    if not ys or not xs:
        return im
    box = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
    return im.crop(box)


def crop_mark(im):
    """切出 V 形标：文字区从 x=364 开始，V 标在 x<340"""
    return im.crop((0, 0, 340, im.height))


def main():
    if not os.path.exists(SRC):
        print(f"❌ 找不到源文件：{SRC}")
        return
    os.makedirs(OUT, exist_ok=True)

    src = Image.open(SRC).convert("RGB")
    print(f"源图 {src.size}")

    # ① 完整 Logo（深色字版）—— header 用（浅色背景）
    full_d = crop_to_content(make_transparent(src))
    full_d.save(os.path.join(OUT, "logo-full-dark.png"), optimize=True)

    # ② 完整 Logo（反白字版）—— 页脚用（深色背景 #0f172a）
    #    切缝 x=348 落在 V 标（最右 334）与字标（最左 364）之间的空白带内
    full_l = recolor_wordmark(make_transparent(src, keep_soft_edge=True),
                               WHITE, brighten_gold=1, split_x=348)
    full_l = crop_to_content(full_l)
    full_l.save(os.path.join(OUT, "logo-full-light.png"), optimize=True)

    # ③ 仅 V 形标（切缝 x=348 左侧部分），再裁掉自身留白
    mark_src = src.crop((0, 0, 348, src.height))
    mark = crop_to_content(make_transparent(mark_src))
    mark.save(os.path.join(OUT, "logo-mark.png"), optimize=True)

    print("\n✅ 已生成：")
    for name in ("logo-full-dark.png", "logo-full-light.png", "logo-mark.png"):
        p = os.path.join(OUT, name)
        im = Image.open(p)
        print(f"   {name:<24} {im.size}  {os.path.getsize(p)/1024:.1f}KB")


if __name__ == "__main__":
    main()
