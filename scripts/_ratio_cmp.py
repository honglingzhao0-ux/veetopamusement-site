"""渲染对比：1:1 容器 vs 4:5 容器，模拟真实素材比例的效果。"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
            )
OUT = ROOT / "scripts" / "_preview"
OUT.mkdir(exist_ok=True)

# 取真实素材
PICK = [
    ("public/images/products/vttr061-minions-wheel.jpeg", 0.85),
    ("public/images/products/vttr063-pop-the-lock.jpeg", 0.85),
    ("public/images/products/vttsp009b-punching-kicking-iib.jpeg", 1.00),
    ("public/images/products/vttr045-all-round-clown.jpeg", 0.85),
]

CARD_W = 240

# 找到实际文件名
avail = {p.stem: p for p in (ROOT / "public" / "images" / "products").glob("*.jpeg")}
picks = []
for want, ratio in PICK:
    stem = Path(want).stem
    # 模糊匹配
    cand = [p for k, p in avail.items() if stem.split("-")[0] in k]
    if cand:
        picks.append((cand[0], ratio))
    else:
        picks.append((None, ratio))


def render_row(container_ratio, label):
    """container_ratio: 宽/高"""
    ch = int(CARD_W / container_ratio)
    tiles = []
    for p, ratio in picks:
        tile = Image.new("RGB", (CARD_W, ch), (255, 255, 255))
        if p:
            im = Image.open(p).convert("RGB")
            # contain 适配
            s = min(CARD_W / im.width, ch / im.height)
            im2 = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
            tile.paste(im2, ((CARD_W - im2.width) // 2, (ch - im2.height) // 2))
        d = ImageDraw.Draw(tile)
        d.rectangle([0, 0, CARD_W - 1, ch - 1], outline=(225, 225, 225))
        tiles.append(tile)
    return tiles, ch


rows = []
for cr, lab in [(1.0, "现状 1:1 容器"), (0.8, "改 4:5 容器")]:
    tiles, ch = render_row(cr, lab)
    rows.append((lab, tiles, ch))

W = CARD_W * 4 + 40
H = sum(ch + 46 for _, _, ch in rows) + 40
canvas = Image.new("RGB", (W, H), (255, 255, 255))
d = ImageDraw.Draw(canvas)

y = 16
for lab, tiles, ch in rows:
    d.text((16, y), lab, fill=(40, 40, 40))
    y += 26
    for i, t in enumerate(tiles):
        canvas.paste(t, (16 + i * (CARD_W + 8), y))
    y += ch + 20

canvas.save(OUT / "ratio_compare.png")

print("=== 对比说明 ===")
for lab, tiles, ch in rows:
    print(f"\n{lab}  (卡片 {CARD_W}×{ch})")
    for i, (p, ratio) in enumerate(picks):
        if ratio < 0.99:
            disp_w = CARD_W * ratio
            pad = (CARD_W - disp_w) / 2
            print(f"   图{i+1} 比例{ratio:.2f} → 宽占{disp_w:.0f}px, 左右各留白 {pad:.0f}px")
        else:
            print(f"   图{i+1} 比例{ratio:.2f} → 宽占{CARD_W}px, 占满")
print(f"\n对比图: {OUT / 'ratio_compare.png'}")
