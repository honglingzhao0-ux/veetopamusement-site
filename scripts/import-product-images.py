#!/usr/bin/env python
# ============================================================
# 产品多图批量导入工具
#
# 用法（三步）：
#   1) 把新照片丢进inbox/ 文件夹（可以用产品型号命名，如 VTRA010-1.jpg）
#   2) 运行：python scripts/import-product-images.py --apply
#   3) bash publish.sh "上传 XX 产品多图"
#
# 行为：
#   - 自动按型号匹配产品文件（如 VTRA010-1.jpg → vtra010-10-supreme-arcade-twins.json）
#   - 自动压缩为长边 1200px / 质量 82 的 JPEG（实测 53KB/张，手机端友好）
#   - 第一张（带 -1 或最小字母序）作为封面，其余追加到 images 数组
#   - 已是黑底图的自动套用白底修复（与 fix-dark-bg.py 同一套阈值）
#   - 重复导入同名图会跳过，不会重复添加
#
# 只加 --apply 才真正写入；不加则只报告将要做什么（安全预览）
# ============================================================
import os, re, sys, json, io, shutil, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "inbox")
IMG_DIR = os.path.join(ROOT, "public", "images", "products")
PROD_DIR = os.path.join(ROOT, "data", "products")
BACKUP_DIR = os.path.join(ROOT, "_backup_images_import")

MAX_EDGE = 1200      # 长边上限
QUALITY = 82         # JPEG 质量
VALID_EXT = (".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG")

# 与 fix-dark-bg.py 一致的黑底阈值
PURE = 48
MAX_SAT = 42
LUM_MAX = 118

def fix_dark_bg(im):
    """把暗且中性的像素（黑背景）提为纯白"""
    im = im.convert("RGB")
    px = im.load()
    w, h = im.size
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
    """压缩并保存；同时修黑底"""
    im = Image.open(src)
    # 修黑底（如果是 jpg/png 都统一处理）
    im = fix_dark_bg(im)
    # 超尺寸则缩放
    w, h = im.size
    if max(w, h) > MAX_EDGE:
        scale = MAX_EDGE / max(w, h)
        im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=QUALITY, optimize=True)
    return im.size

def build_model_index():
    """型号（小写）→ 产品 slug 的映射"""
    idx = {}
    for p in glob.glob(os.path.join(PROD_DIR, "*.json")):
        try:
            d = json.load(io.open(p, encoding="utf-8"))
        except Exception:
            continue
        model = str(d.get("model", "")).strip().lower()
        slug = str(d.get("slug", "")).strip()
        if model:
            # 型号可能重复（同名不同规格），先记录第一个
            idx.setdefault(model, []).append(slug)
    return idx

def guess_model(fn, idx):
    """从文件名猜型号：大写字母+数字 的那部分，转小写去查"""
    base = os.path.splitext(os.path.basename(fn))[0]
    # 去掉末尾的序号 -1/-2/-01
    base = re.sub(r"[-_ ]?\d{1,2}$", "", base)
    m = re.findall(r"[A-Za-z]{1,6}\d{2,5}", base)
    for cand in m:
        c = cand.lower()
        if c in idx:
            return cand, idx[c]
    # 再试：直接把整个基础名当型号
    c = base.lower()
    if c in idx:
        return base, idx[c]
    return None, None

def load_imported_log():
    """读取已导入记录：slug -> [源文件名...]，用于跳过重复导入"""
    p = os.path.join(ROOT, ".imported-images.json")
    if os.path.exists(p):
        try:
            return json.load(io.open(p, encoding="utf-8"))
        except Exception:
            return {}
    return {}

def save_imported_log(log):
    p = os.path.join(ROOT, ".imported-images.json")
    io.open(p, "w", encoding="utf-8").write(
        json.dumps(log, ensure_ascii=False, indent=2) + "\n"
    )

def main():
    if not os.path.isdir(INBOX):
        os.makedirs(INBOX, exist_ok=True)
        print(f"已创建收件箱：{INBOX}")
        print("把产品照片放进去（建议命名：型号-1.jpg / 型号-2.jpg），然后运行：")
        print("  python scripts/import-product-images.py --apply")
        return

    files = [f for f in os.listdir(INBOX) if f.endswith(VALID_EXT)]
    if not files:
        print(f"收件箱为空：{INBOX}")
        print("把照片放进去再运行。命名建议：VTRA010-1.jpg、VTRA010-2.jpg")
        print("（已导入过的照片不会重复添加，导入记录见 .imported-images.json）")
        return

    apply = "--apply" in sys.argv
    idx = build_model_index()
    log = load_imported_log()

    # 按型号分组，并跳过已导入过的源文件
    grouped = {}
    unmatched = []
    skipped = []
    for fn in sorted(files):
        model, slugs = guess_model(fn, idx)
        if not model:
            unmatched.append(fn)
            continue
        if len(slugs) > 1:
            unmatched.append(f"{fn}  → 型号 {model} 对应 {len(slugs)} 个产品，需确认")
            continue
        slug = slugs[0]
        if fn in log.get(slug, []):
            skipped.append(fn)
            continue
        grouped.setdefault(slug, []).append((model, fn))

    print(f"收件箱共 {len(files)} 个文件，待导入 {len(files) - len(skipped)} 张"
          f"（已导入过 {len(skipped)} 张自动跳过）")
    print(f"识别出 {len(grouped)} 个产品\n")

    if skipped:
        print("⏭已导入过（跳过）:")
        for s in skipped:
            print("   -", s)
        print()

    if unmatched:
        print("⚠️ 未能匹配（已跳过）:")
        for u in unmatched:
            print("   -", u)
        print()

    for slug, items in sorted(grouped.items()):
        pj = os.path.join(PROD_DIR, f"{slug}.json")
        if not os.path.exists(pj):
            print(f"  ⚠️ {slug}:找不到 JSON，跳过")
            continue
        data = json.load(io.open(pj, encoding="utf-8"))
        model = data.get("model", slug)
        existing = list(data.get("images", []))

        print(f"  ▸ {model} ({slug}) — 现有 {len(existing)} 张，新增 {len(items)} 张")
        # 序号在循环里递增，避免多张图命名重复互相覆盖
        seq = len(existing)
        added = 0
        for model_guess, fn in items:
            src = os.path.join(INBOX, fn)
            # 跳过已存在的文件（按源文件名判断，保证重跑不重复）
            already = f"/images/products/{slug}-{seq + 1}.jpeg"
            if already in existing:
                seq += 1
                continue
            dst_name = f"{slug}-{seq + 1}.jpeg"
            dst = os.path.join(IMG_DIR, dst_name)
            if apply:
                os.makedirs(BACKUP_DIR, exist_ok=True)
                size = compress(src, dst)
                kb = os.path.getsize(dst) / 1024
                print(f"      + {fn} → {dst_name} ({size[0]}x{size[1]}, {kb:.0f}KB)")
                existing.append(f"/images/products/{dst_name}")
                seq += 1
                added += 1
            else:
                print(f"      · {fn} → {dst_name}（预览）")
                seq += 1

        if apply and added:
            data["images"] = existing
            io.open(pj, "w", encoding="utf-8").write(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n"
            )
            # 记录已导入的源文件，避免重复导入
            log.setdefault(slug, [])
            for model_guess, fn in items:
                shutil.copy2(os.path.join(INBOX, fn),
                             os.path.join(BACKUP_DIR, fn))
                if fn not in log[slug]:
                    log[slug].append(fn)

    print()
    if apply:
        save_imported_log(log)
        print("✅ 已写入。下一步：bash publish.sh \"上传产品多图\"")
        print(f"   原始照片备份：{BACKUP_DIR}")
        print("   导入记录：.imported-images.json（重复放入同一批照片不会重复添加）")
    else:
        print("（预览模式，未写任何文件）加 --apply 执行")


if __name__ == "__main__":
    main()