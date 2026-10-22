#!/usr/bin/env python
# ============================================================
# 产品多图导入（精确 slug 版）
#
# 与 import-product-images.py 的区别：
#   - 不靠文件名猜型号，直接读 _jobs/inbox_manifest.json
#     （每张图已人工核对过 slug，支持一个型号对应多个 slug，
#      如 VTKR108 → vtkr108-3d-car / vtkr108-happy-childhood-3p）
#   - 已有封面图保留，新图追加到 images 数组末尾
#   - 跳过内容重复（与站点已有图 sha 相同）
#   - 压缩为长边 1200px / 质量 82 的 JPEG
#   - 已是黑底图的自动套用白底修复
#
# 用法：
#   python scripts/import-multi-images.py            # 预览
#   python scripts/import-multi-images.py --apply     # 执行
# ============================================================
import os, re, sys, json, glob, hashlib
from collections import defaultdict
from PIL import Image

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
INBOX = os.path.join(WORK, "inbox_x")
IMG_DIR = os.path.join(WORK, "public", "images", "products")
PROD_DIR = os.path.join(WORK, "data", "products")
MANIFEST = os.path.join(WORK, "_jobs", "inbox_manifest.json")
BACKUP = os.path.join(WORK, "_backup_images_multi")

MAX_EDGE = 1200
QUALITY = 82

# 黑底阈值（与 fix-dark-bg.py 一致）
PURE = 48
MAX_SAT = 42
LUM_MAX = 118


def fix_dark_bg(im):
    """暗且中性的像素（黑背景）提为纯白（numpy 加速版）"""
    im = im.convert("RGB")
    try:
        import numpy as np
        a = np.asarray(im).copy()
        lum = a.max(axis=2)
        sat = lum - a.min(axis=2)
        mask = (lum < LUM_MAX) & (sat < MAX_SAT)
        if mask.any():
            a[mask] = (255, 255, 255)
            im = Image.fromarray(a, "RGB")
        return im
    except ImportError:
        # 退化为纯 Python 逐像素
        w, h = im.size
        px = im.load()
        out = im.copy()
        opx = out.load()
        for y in range(h):
            for x in range(w):
                r, g, b = px[x, y]
                lum = max(r, g, b)
                sat = lum - min(r, g, b)
                if lum < LUM_MAX and sat < MAX_SAT:
                    opx[x, y] = (255, 255, 255)
        return out


def compress(src, dst):
    im = Image.open(src)
    im = fix_dark_bg(im)
    w, h = im.size
    if max(w, h) > MAX_EDGE:
        s = MAX_EDGE / max(w, h)
        im = im.resize((int(w * s), int(h * s)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=QUALITY, optimize=True)
    return im.size


def sha(p):
    return hashlib.sha1(open(p, "rb").read()).hexdigest()


def main():
    apply = "--apply" in sys.argv
    if not os.path.exists(MANIFEST):
        print("找不到 manifest")
        return

    manifest = json.load(open(MANIFEST, encoding="utf-8"))

    # slug → [(源文件, 归档文件名)]
    by_slug = defaultdict(list)
    for fname, rec in manifest.items():
        slug = rec.get("slug")
        if not slug:
            continue
        by_slug[slug].append((os.path.join(INBOX, fname), fname, rec))

    print(f"manifest 共 {len(manifest)} 张，覆盖 {len(by_slug)} 个 slug\n")

    total_add = 0
    total_skip = 0
    touched = []

    for slug in sorted(by_slug):
        pj = os.path.join(PROD_DIR, f"{slug}.json")
        if not os.path.exists(pj):
            print(f"  ⚠️ {slug}: 找不到 JSON，跳过")
            continue
        data = json.load(open(pj, encoding="utf-8"))
        existing = list(data.get("images", []))

        # 站点已有图的内容 sha，避免重复
        exist_sha = set()
        for rel in existing:
            ap = os.path.join(WORK, "public", rel.lstrip("/"))
            if os.path.exists(ap):
                exist_sha.add(sha(ap))

        # 该 slug 已有多少张
        seq = len(existing)
        added = 0
        plan = []
        for src, fname, rec in by_slug[slug]:
            if not os.path.exists(src):
                continue
            h = sha(src)
            if h in exist_sha:
                total_skip += 1
                continue
            exist_sha.add(h)
            seq += 1
            dst_name = f"{slug}-{seq}.jpeg"
            plan.append((src, dst_name))

        if not plan:
            continue

        print(f"  ▸ {slug} ({data.get('model','')}): 现有 {len(existing)} 张, 新增 {len(plan)} 张")
        for src, dst_name in plan:
            dst = os.path.join(IMG_DIR, dst_name)
            if apply:
                os.makedirs(BACKUP, exist_ok=True)
                size = compress(src, dst)
                kb = os.path.getsize(dst) / 1024
                print(f"      + {os.path.basename(src)} → {dst_name} "
                      f"({size[0]}x{size[1]}, {kb:.0f}KB)")
                existing.append(f"/images/products/{dst_name}")
                added += 1
            else:
                print(f"      · {os.path.basename(src)} → {dst_name}（预览）")

        if apply and added:
            data["images"] = existing
            json.dump(data, open(pj, "w", encoding="utf-8"),
                      ensure_ascii=False, indent=2)
            touched.append(slug)

        total_add += len(plan)

    print()
    if apply:
        print(f"✅ 已写入：新增 {total_add} 张，去重跳过 {total_skip} 张，"
              f"更新 {len(touched)} 个产品")
        print(f"   备份目录：{BACKUP}")
        print("   下一步：bash publish.sh \"批量补充产品多图\"")
    else:
        print(f"（预览）将新增 {total_add} 张，去重跳过 {total_skip} 张")
        print("加 --apply 执行")


if __name__ == "__main__":
    main()
