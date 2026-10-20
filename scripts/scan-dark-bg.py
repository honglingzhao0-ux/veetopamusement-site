#!/usr/bin/env python
# 扫描产品图片，检测黑底比例
# 判据：采样四边边缘像素，若绝大部分为极暗色（各通道 < 60）判定为黑底图
import os, sys, json
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "public/images/products"
THRESH = 60          # 亮度阈值
EDGE_RATIO = 0.80    # 边缘采样中暗像素占比超过此值 → 判为黑底

rows = []
for fn in sorted(os.listdir(SRC)):
    if not fn.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    p = os.path.join(SRC, fn)
    try:
        im = Image.open(p).convert("RGB")
    except Exception as e:
        rows.append((fn, -1, f"读取失败 {e}"))
        continue
    w, h = im.size
    # 采样：上下左右各 12 个边缘点（避开正中间的产品主体）
    pts = []
    n = 12
    for i in range(n):
        x = int(w * (i + 0.5) / n)
        pts.append((x, 0))
        pts.append((x, h - 1))
    for i in range(n):
        y = int(h * (i + 0.5) / n)
        pts.append((0, y))
        pts.append((w - 1, y))
    dark = 0
    tot = len(pts)
    for (x, y) in pts:
        r, g, b = im.getpixel((x, y))
        if r < THRESH and g < THRESH and b < THRESH:
            dark += 1
    ratio = dark / tot
    rows.append((fn, ratio, f"{w}x{h} 边缘暗像素 {dark}/{tot}"))

black = [r for r in rows if isinstance(r[1], float) and r[1] >= EDGE_RATIO]
near = [r for r in rows if isinstance(r[1], float) and 0.45 <= r[1] < EDGE_RATIO]
ok = [r for r in rows if isinstance(r[1], float) and r[1] < 0.45]

print(f"总图片: {len(rows)}")
print(f"明显黑底(边缘暗>=80%): {len(black)}")
print(f"疑似偏暗(45%-80%): {len(near)}")
print(f"正常(<45%): {len(ok)}")
print()
print("=== 黑底清单 ===")
for fn, ratio, info in sorted(black, key=lambda x: -x[1]):
    print(f"{ratio*100:5.1f}%  {fn}  [{info}]")
print()
print("=== 疑似偏暗清单 ===")
for fn, ratio, info in sorted(near, key=lambda x: -x[1]):
    print(f"{ratio*100:5.1f}%  {fn}  [{info}]")