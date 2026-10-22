#!/usr/bin/env python
# ============================================================
# 回滚：删除被错误「黑底修复」污染的 510 张图，产品 JSON 复位
#
# 背景（2026-10-22）：
#   导入时套用了 fix_dark_bg（阈值 lum<118 且 sat<42 → 刷白）。
#   该算法原为「纯黑底抠图」设计，对这批产品实拍图完全不适用：
#   黑色机身也被判成黑背景被刷白 → 画面几乎全白、机身细节全丢。
#   例：vtsa043 原图（黑机身+绿火焰+白底）→ 修复后机身全白只剩蓝绿轮廓。
#
#   对策：本批原图本身就是干净白底，不需要修背景。
#         去掉 fix_dark_bg，直接压缩即可。
#
# 用法：python scripts/rollback-dark-fix.py
# ============================================================
import os, json, glob, shutil

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
PUB = os.path.join(WORK, "public", "images", "products")
BACKUP = os.path.join(WORK, "_backup_darkfix_polluted")

os.makedirs(BACKUP, exist_ok=True)

removed = 0
kept = 0
for p in glob.glob(os.path.join(WORK, "data", "products", "*.json")):
    d = json.load(open(p, encoding="utf-8"))
    imgs = d.get("images", [])
    if len(imgs) <= 1:
        continue
    cover = imgs[0]
    # 其余 = 本次生成的错误图
    for rel in imgs[1:]:
        fp = os.path.join(WORK, "public", rel.lstrip("/"))
        if os.path.exists(fp):
            shutil.copy2(fp, os.path.join(BACKUP, os.path.basename(fp)))
            os.remove(fp)
            removed += 1
    d["images"] = [cover]
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    kept += 1

print(f"已复位 {kept} 个产品的 images 数组（各留 1 张原封面）")
print(f"已删除 {removed} 张被污染的新增图（备份在 {os.path.basename(BACKUP)}/）")

# 清理 public 下没被任何 JSON 引用的孤儿文件
referenced = set()
for p in glob.glob(os.path.join(WORK, "data", "products", "*.json")):
    d = json.load(open(p, encoding="utf-8"))
    for rel in d.get("images", []):
        referenced.add(os.path.basename(rel))

orphans = 0
for f in os.listdir(PUB):
    if f not in referenced:
        shutil.move(os.path.join(PUB, f), os.path.join(BACKUP, f))
        orphans += 1
print(f"移出孤儿文件 {orphans} 个")
print(f"public 现存 {len(os.listdir(PUB))} 张（应 = 210 张原封面）")
