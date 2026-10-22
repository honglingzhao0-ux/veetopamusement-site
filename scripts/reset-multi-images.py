#!/usr/bin/env python
# ============================================================
# 彻底重置多图导入状态（2026-10-22）
#
# 问题链：
#   1) 回滚删了 public 里的图，但产品 JSON 的 images 数组只删了 imgs[1:]，
#      序号起点与 manifest 顺序不一致 → 导入器把同一张原图写成了
#      -2/-4 两个不同文件名（内容哈希相同）→ 站点上出现重复图。
#
# 对策：完全重置，不做增量修补。
#   1) 产品 JSON 的 images 数组复位为「只有原封面」= imgs[0]
#      （封面是 Accio Work 时代的老素材，没被污染过）
#   2) public/images/products 下所有「带 -N 序号后缀」的文件全部删除
#      （保留每个 slug 的封面 = <slug>.jpeg）
#   3) 清空 .imported-images.json 之类的导入日志
#   4) 之后跑 import-multi-images.py --apply 一次性干净导入
#
# 用法：python scripts/reset-multi-images.py
# ============================================================
import os, json, glob, re, shutil

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
PUB = os.path.join(WORK, "public", "images", "products")
BAK = os.path.join(WORK, "_backup_darkfix_polluted")

os.makedirs(BAK, exist_ok=True)

# 1) 收集所有合法封面（= 产品 JSON 的 imgs[0]）
covers = set()
for p in glob.glob(os.path.join(WORK, "data", "products", "*.json")):
    d = json.load(open(p, encoding="utf-8"))
    imgs = d.get("images", [])
    if imgs:
        covers.add(os.path.basename(imgs[0]))

# 2) 产品 JSON 复位
reset = 0
for p in glob.glob(os.path.join(WORK, "data", "products", "*.json")):
    d = json.load(open(p, encoding="utf-8"))
    imgs = d.get("images", [])
    if len(imgs) > 1:
        d["images"] = imgs[:1]
        json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        reset += 1
print(f"复位产品 JSON: {reset} 个（各留 1 张原封面）")

# 3) 删除 public 下所有非封面文件
deleted = 0
for f in os.listdir(PUB):
    if f in covers:
        continue
    src = os.path.join(PUB, f)
    if os.path.isfile(src):
        shutil.copy2(src, os.path.join(BAK, f))
        os.remove(src)
        deleted += 1
print(f"删除非封面文件: {deleted} 张")

left = os.listdir(PUB)
print(f"public 现存: {len(left)} 张（封面 {len(covers)} 张）")
extra = [f for f in left if f not in covers]
if extra:
    print(f"⚠️ 仍非封面: {len(extra)} → {extra[:5]}")

# 4) 校验所有封面文件都在
missing = [c for c in covers if not os.path.exists(os.path.join(PUB, c))]
print(f"缺失封面: {len(missing)} {missing[:5]}")
