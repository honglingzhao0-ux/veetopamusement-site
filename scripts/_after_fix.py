"""验证调整后的效果：渲染 4:5 容器 + 真实素材，含补白后的 5 张方图。"""
import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
            )
OUT = ROOT / "scripts" / "_preview"
OUT.mkdir(exist_ok=True)

CARD_W = 250
CH = int(CARD_W * 5 / 4)

# 真实取几个产品（含补白后的方图）
PICKS = ["vttr061-minions-wheel", "vttr063-pop-the-lock", "vtsp009b-punching-kicking-iib",
         "vttr045-all-round-clown", "vtsp007-boxing-ib-20", "vttr067-luck-quick-drop"]

found = []
for stem in PICKS:
    for p in (ROOT / "public" / "images" / "products").rglob(f"{stem}*"):
        found.append(p)
        break

W = CARD_W * len(found) + 40
H = CH + 90
canvas = Image.new("RGB", (W, H), (245, 245, 245))
d = ImageDraw.Draw(canvas)
d.text((16, 10), "4:5 container (after fix) - real assets", fill=(40, 40, 40))

x = 16
for p in found:
    tile = Image.new("RGB", (CARD_W, CH), (255, 255, 255))
    im = Image.open(p).convert("RGB")
    s = min(CARD_W / im.width, CH / im.height)
    im2 = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    tile.paste(im2, ((CARD_W - im2.width) // 2, (CH - im2.height) // 2))
    d2 = ImageDraw.Draw(tile)
    d2.rectangle([0, 0, CARD_W - 1, CH - 1], outline=(215, 215, 215))
    canvas.paste(tile, (x, 40))
    # 标注实际占宽
    d.text((x + 4, CH + 48), f"w={im2.width}/{CARD_W}", fill=(90, 90, 90))
    x += CARD_W + 4

canvas.save(OUT / "after_fix.png")

print("=== 4:5 容器下的实际占宽 ===")
for p in found:
    im = Image.open(p)
    s = min(CARD_W / im.width, CH / im.height)
    w2 = int(im.width * s)
    h2 = int(im.height * s)
    pct = w2 / CARD_W * 100
    print(f"  {p.name[:38]:40} {im.size} → 显示 {w2}×{h2}  宽占 {pct:.0f}%")
print(f"\n对比图: {OUT / 'after_fix.png'}")
