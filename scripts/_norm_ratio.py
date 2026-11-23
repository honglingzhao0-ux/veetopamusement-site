"""找出比例不一致的图，并生成统一比例的版本（不覆盖原图）。"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
            )
LOG = ROOT / "scripts" / "_odd_ratio_log.txt"
L = []


def W(s=""):
    L.append(str(s))
    LOG.write_text("\n".join(L), encoding="utf-8")


TARGET = 0.85   # 205/210 张已经是这个比例
ODD = []

for f in sorted((ROOT / "data" / "products").glob("*.json")):
    d = json.loads(f.read_text(encoding="utf-8"))
    if not d.get("images"):
        continue
    p = ROOT / "public" / d["images"][0].lstrip("/")
    if not p.exists():
        continue
    with Image.open(p) as im:
        w, h = im.size
    r = w / h
    if abs(r - TARGET) > 0.02:
        ODD.append((d["model"], d["name"], d["images"][0], w, h, r))

W(f"=== 比例 ≠ {TARGET} 的图（{len(ODD)} 张）===")
for m, n, path, w, h, r in ODD:
    W(f"  {m:10} {str((w,h)):12} ratio {r:.2f}  {path}")
    W(f"             {n}")

W("\n=== 处理方案：给方图补白边到 0.85（生成新文件，不覆盖原图）===")
GEN = ROOT / "public" / "images" / "products" / "_normalized"
GEN.mkdir(exist_ok=True)
mapping = {}

for m, n, path, w, h, r in ODD:
    src = ROOT / "public" / path.lstrip("/")
    with Image.open(src) as im:
        im = im.convert("RGBA")
        # 目标尺寸：保持宽度，加高到 0.85
        new_h = int(round(w / TARGET))
        canvas = Image.new("RGBA", (w, new_h), (255, 255, 255, 255))
        # 上下居中
        canvas.paste(im, (0, (new_h - h) // 2), im)
        out_name = src.stem + "-n.jpg"
        out_path = GEN / out_name
        canvas.convert("RGB").save(out_path, "JPEG", quality=88, optimize=True)
        new_rel = f"/images/products/_normalized/{out_name}"
        mapping[path] = new_rel
        W(f"  {m:10} {str((w,h))} → {str((w,new_h))}  {new_rel}")

W("\n=== 写回产品 JSON ===")
changed = 0
for f in sorted((ROOT / "data" / "products").glob("*.json")):
    d = json.loads(f.read_text(encoding="utf-8"))
    hit = False
    for i, img in enumerate(d.get("images", [])):
        if img in mapping:
            d["images"][i] = mapping[img]
            hit = True
    if hit:
        f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changed += 1
        W(f"  ✅ {d['model']:10} {d['name'][:30]}")
W(f"\n共更新 {changed} 个产品 JSON")

LOG.write_text("\n".join(L), encoding="utf-8")
print("OK")
