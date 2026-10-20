#!/usr/bin/env python
# ============================================================
# 生成社交分享图（og:image / twitter:image）
# 尺寸 1200×630（OG 标准），从现有 banner 裁切 + 深色渐变遮罩 + 品牌文字
# 用法：python scripts/make-og-image.py
# ============================================================
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "banners", "hero-1.jpg")
OUT = os.path.join(ROOT, "public", "og", "og-default.jpg")
W, H = 1200, 630

NAVY = (11, 27, 43)
ORANGE = (244, 81, 30)

def load_font(size, bold=False):
    """在 Windows 上找可用字体"""
    cands = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/bahnschrift.ttf",
    ]
    for c in cands:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

def main():
    if not os.path.exists(SRC):
        print(f"❌ 找不到源图：{SRC}")
        return

    im = Image.open(SRC).convert("RGB")
    # 裁切为 1200×630（保持比例，居中裁）
    target_ratio = W / H
    w, h = im.size
    if w / h > target_ratio:
        # 太宽，裁两侧
        nw = int(h * target_ratio)
        left = (w - nw) // 2
        im = im.crop((left, 0, left + nw, h))
    else:
        # 太高，裁上下（略偏上，保留主体）
        nh = int(w / target_ratio)
        top = int((h - nh) * 0.35)
        im = im.crop((0, top, w, top + nh))
    im = im.resize((W, H), Image.LANCZOS)

    # 左侧深色渐变遮罩，保证文字可读
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for x in range(W):
        # 前 55% 几乎全遮，之后快速淡出
        ratio = x / 720
        a = int(238 * max(0, 1 - ratio ** 1.6))
        od.line([(x, 0), (x, H)], fill=NAVY + (a,))
    im = Image.alpha_composite(im.convert("RGBA"), overlay)

    # 品牌文字
    d = ImageDraw.Draw(im)
    f_brand = load_font(74, bold=True)
    f_sub = load_font(30)
    f_desc = load_font(24)

    x0 = 72
    # 橙色竖条
    d.rectangle([x0, 168, x0 + 9, 168 + 62], fill=ORANGE)
    d.text((x0 + 28, 165), "VEETOP", font=f_brand, fill=(255, 255, 255))
    d.text((x0 + 30, 248), "AMUSEMENT", font=f_sub, fill=ORANGE)
    d.text((x0 + 2, 318), "Arcade & Amusement Equipment", font=f_desc, fill=(226, 232, 240))
    d.text((x0 + 2, 352), "Factory Direct  |  OEM / ODM  |  CE Certified", font=f_desc, fill=(148, 163, 184))
    d.text((x0 + 2, 404), "www.veetopamusement.com", font=f_desc, fill=(148, 163, 184))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    im.convert("RGB").save(OUT, "JPEG", quality=88, optimize=True)
    kb = os.path.getsize(OUT) / 1024
    print(f"✅ 已生成：{os.path.relpath(OUT, ROOT)}  ({W}×{H}, {kb:.0f}KB)")

if __name__ == "__main__":
    main()