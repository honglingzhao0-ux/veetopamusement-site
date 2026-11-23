"""检查产品源图的像素尺寸与宽高比 —— 解释为什么网格里图片显示大小不一。"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site")
LOG = ROOT / "scripts" / "_img_size_log.txt"
L = []


def W(s=""):
    L.append(str(s))
    LOG.write_text("\n".join(L), encoding="utf-8")


W("=== 全部 210 个产品首图的宽高比分布 ===")
ratios = []
for f in sorted((ROOT / "data" / "products").glob("*.json")):
    d = json.loads(f.read_text(encoding="utf-8"))
    if not d.get("images"):
        continue
    p = ROOT / "public" / d["images"][0].lstrip("/")
    if not p.exists():
        W(f"  ❌ 缺图: {d['model']} {d['images'][0]}")
        continue
    with Image.open(p) as im:
        w, h = im.size
    ratios.append((w / h, d["model"], d["name"], w, h, d["images"][0]))

ratios.sort()
W(f"  有效产品数: {len(ratios)}")
W(f"  宽高比 最小 {ratios[0][0]:.2f}  最大 {ratios[-1][0]:.2f}")

# 分档统计
BANDS = [
    ("横版 (<0.8)", 0, 0.8),
    ("接近方形 (0.8-1.25)", 0.8, 1.25),
    ("竖版 (1.25-1.8)", 1.25, 1.8),
    ("超竖版 (>1.8)", 1.8, 99),
]
W("\n=== 宽高比分档（比例 = 宽/高）===")
for label, lo, hi in BANDS:
    n = len([r for r in ratios if lo <= r[0] < hi])
    W(f"  {label:24} {n:4} 个  ({n/len(ratios)*100:.0f}%)")

W("\n=== 在 1:1 正方形容器里 contain 适配后的实际占位 ===")
W("  容器 1:1，图 contain → 图的实际显示高度 = 容器高 × min(1, 1/比例)")
W("  比例越小（越竖），显示高度越接近容器高、宽度越窄")
W("")
W(f"  {'model':10} {'ratio':6} {'源图尺寸':12} {'显示高占比':10} {'显示宽占比':10}  名称")
for r, m, n, w, h, path in ratios[:4] + ratios[-4:]:
    if r <= 1:
        hh, ww = 1.0, r
    else:
        hh, ww = 1 / r, 1.0
    W(f"  {m:10} {r:6.2f} {str((w,h)):12} {hh*100:9.0f}% {ww*100:9.0f}%  {n[:28]}")

W("\n=== 图中出现过的具体产品 ===")
MODELS = ["VTTR045", "VTTR060", "VTTR061", "VTTR062", "VTTR063",
          "VTTR064", "VTTR065", "VTTR066", "VTTR067", "VTTR068",
          "VTTR069", "VTTR070", "VTTR071", "VTTR072", "VTTR073",
          "VTTR074", "VTTR075", "VTTR076"]
for r, m, n, w, h, path in ratios:
    if m in MODELS:
        if r <= 1:
            hh, ww = 1.0, r
        else:
            hh, ww = 1 / r, 1.0
        W(f"  {m:10} {r:6.2f} {str((w,h)):12} 高{hh*100:3.0f}% 宽{ww*100:3.0f}%  {n[:30]}")

LOG.write_text("\n".join(L), encoding="utf-8")
print("OK")
