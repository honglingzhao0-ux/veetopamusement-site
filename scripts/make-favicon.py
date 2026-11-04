"""生成 PNG 版 favicon（app/icon.png），供不支持 SVG favicon 的场景。"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site")
OUT = ROOT / "app" / "icon.png"
S = 512  # 生成大尺寸，再由 Next 缩放

im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)

# 深色圆角底
d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=(11, 27, 43, 255))


def sc(v):
    return v / 64 * S


# 红色左斜面（主）
d.polygon([(sc(8), sc(14)), (sc(21), sc(14)), (sc(54), sc(54)),
           (sc(41), sc(54))], fill=(179, 18, 27, 255))
# 红色高光条
d.polygon([(sc(21), sc(14)), (sc(27), sc(14)), (sc(55), sc(54)),
           (sc(49), sc(54))], fill=(224, 31, 39, 255))
# 金色右侧面
d.polygon([(sc(40), sc(13)), (sc(54), sc(13)), (sc(51), sc(55)),
           (sc(37), sc(49))], fill=(245, 197, 24, 255))
# 金色高光
d.polygon([(sc(40), sc(13)), (sc(54), sc(13)), (sc(52.5), sc(34)),
           (sc(40.5), sc(30.5))], fill=(255, 224, 102, 255))

im.save(OUT)
print(f"✅ {OUT}  {im.size}  {OUT.stat().st_size/1024:.1f}KB")

# 预览
bg = Image.new("RGB", (S, S), (255, 255, 255))
bg.paste(im, (0, 0), im)
bg.resize((128, 128), Image.LANCZOS).save(ROOT / "scripts" / "_preview" / "favicon_128.png")
print("预览: favicon_128.png")
