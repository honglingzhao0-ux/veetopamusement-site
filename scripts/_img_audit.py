"""产品图素材全面体检：宽高比 / 分辨率 / 背景类型（实拍 vs 白底）。"""
import json
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
            )
LOG = ROOT / "scripts" / "_img_audit_log.txt"
L = []


def W(s=""):
    L.append(str(s))
    LOG.write_text("\n".join(L), encoding="utf-8")


def classify_bg(im):
    """判断背景类型：采样四边与四角，判断是否接近纯白"""
    w, h = im.size
    rgb = im.convert("RGB")
    px = rgb.load()
    samples = []
    # 四条边的采样点
    for frac in (0.02, 0.1, 0.5, 0.9, 0.98):
        x = min(w - 1, int(w * frac))
        samples.append(px[x, 0])
        samples.append(px[x, h - 1])
        y = min(h - 1, int(h * frac))
        samples.append(px[0, y])
        samples.append(px[w - 1, y])
    # 四角
    for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        samples.append(px[cx, cy])

    # 边缘点中"非白"（饱和度或暗度足够）的比例
    non_white = 0
    for r, g, b in samples:
        mx, mn = max(r, g, b), min(r, g, b)
        if mx < 240 or (mx - mn) > 12:
            non_white += 1
    return "白底" if non_white <= 4 else "实拍/有色背景"


rows = []
for f in sorted((ROOT / "data" / "products").glob("*.json")):
    d = json.loads(f.read_text(encoding="utf-8"))
    if not d.get("images"):
        continue
    p = ROOT / "public" / d["images"][0].lstrip("/")
    if not p.exists():
        continue
    with Image.open(p) as im:
        w, h = im.size
        bg = classify_bg(im)
    rows.append({
        "model": d["model"], "name": d["name"], "w": w, "h": h,
        "ratio": w / h, "bg": bg, "file": p.name,
    })

W(f"=== 体检 {len(rows)} 个产品首图 ===")

W("\n=== 1. 宽高比 ===")
c = Counter(round(r["ratio"], 2) for r in rows)
for ratio, n in sorted(c.items()):
    W(f"  {ratio:5.2f} : {n:4} 个 ({n/len(rows)*100:.0f}%)")

W("\n=== 2. 分辨率 ===")
res = Counter((r["w"], r["h"]) for r in rows)
for (w, h), n in sorted(res.items(), key=lambda x: -x[1])[:12]:
    W(f"  {w:5}×{h:<5} : {n:4} 个")
small = [r for r in rows if r["w"] < 500]
W(f"  宽度 < 500px 的: {len(small)} 个")
if small:
    W(f"    最小: {min(r['w'] for r in rows)}×{min(r['h'] for r in rows)}")

W("\n=== 3. 背景类型 ===")
bgc = Counter(r["bg"] for r in rows)
for k, n in bgc.most_common():
    W(f"  {k:14} {n:4} 个 ({n/len(rows)*100:.0f}%)")

W("\n=== 4. 「实拍/有色背景」的产品清单 ===")
shots = [r for r in rows if r["bg"] != "白底"]
W(f"  共 {len(shots)} 个：")
for r in sorted(shots, key=lambda x: x["model"]):
    W(f"    {r['model']:10} {str((r['w'], r['h'])):12} ratio {r['ratio']:.2f}  {r['name'][:34]}")

W("\n=== 5. 交叉：比例 × 背景 ===")
cross = Counter((round(r["ratio"], 2), r["bg"]) for r in rows)
for (ratio, bg), n in sorted(cross.items()):
    W(f"  {ratio:5.2f} + {bg:14} {n:4} 个")

W("\n=== 6. 1:1 容器里的实际显示（object-fit: contain）===")
W("  容器是 1:1 正方形，图 contain 适配：")
for ratio in sorted(c):
    disp = "高度占满，左右各留白" if ratio < 0.99 else "完整占满方框"
    W(f"    比例 {ratio:.2f} → {disp}")

LOG.write_text("\n".join(L), encoding="utf-8")
print("OK")
