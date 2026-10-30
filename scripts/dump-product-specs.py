#!/usr/bin/env python
"""导出产品关键规格（尺寸/功率/重量）与 slug 清单，供写作文章引用真实数据。"""
import json
import pathlib
import re
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDIR = ROOT / "data" / "products"
CDIR = ROOT / "data"

cats = json.loads((CDIR / "categories.json").read_text(encoding="utf-8"))
cat_slug = {c["id"]: c["slug"] for c in cats}

rows = []
by_cat = defaultdict(list)
for f in sorted(PDIR.glob("*.json")):
    p = json.loads(f.read_text(encoding="utf-8"))
    specs = {s["label"]: s["value"] for s in p.get("specs", [])}
    size = specs.get("Size", "")
    power = specs.get("Power", "")
    weight = specs.get("Unit Weight", specs.get("Weight", ""))
    by_cat[p["category"]].append(p["slug"])
    rows.append(
        {
            "model": p.get("model", ""),
            "name": p.get("name", ""),
            "cat": p["category"],
            "cat_slug": cat_slug.get(p["category"], p["category"]),
            "slug": p["slug"],
            "size": size,
            "power": power,
            "weight": weight,
            "images": len(p.get("images", [])),
        }
    )

out = []
out.append("=== 按品类统计 ===")
for c in cats:
    items = [r for r in rows if r["cat"] == c["id"]]
    out.append(
        f"{c['slug']} | {c['name']} | {len(items)} 款 | "
        f"有尺寸 {sum(1 for r in items if r['size'])} | "
        f"有功率 {sum(1 for r in items if r['power'])} | "
        f"有重量 {sum(1 for r in items if r['weight'])}"
    )

out.append("")
out.append("=== 功率分布 ===")
pw = defaultdict(list)
for r in rows:
    if r["power"]:
        pw[r["power"]].append(r["model"])
for k in sorted(pw, key=lambda x: (len(pw[x])), reverse=True):
    out.append(f"{k} -> {len(pw[k])} 款")

out.append("")
out.append("=== 尺寸分布（Top 40）===")
sz = defaultdict(list)
for r in rows:
    if r["size"]:
        sz[r["size"]].append(r["model"])
for k, v in sorted(sz.items(), key=lambda x: -len(x[1]))[:40]:
    out.append(f"{k} -> {len(v)} 款 :: {', '.join(v[:6])}")

out.append("")
out.append("=== 重量分布 ===")
wt = defaultdict(list)
for r in rows:
    if r["weight"]:
        wt[r["weight"]].append(r["model"])
for k, v in sorted(wt.items(), key=lambda x: -len(x[1]))[:30]:
    out.append(f"{k} -> {len(v)} 款 :: {', '.join(v[:5])}")

out.append("")
out.append("=== 全部产品明细（model | cat_slug | slug | size | power | weight）===")
for r in rows:
    out.append(
        f"{r['model']} | {r['cat_slug']} | {r['slug']} | {r['size']} | {r['power']} | {r['weight']}"
    )

dest = ROOT / "scripts" / "_product_specs_dump.txt"
dest.write_text("\n".join(out), encoding="utf-8")
print("written:", dest, len(rows), "products")
