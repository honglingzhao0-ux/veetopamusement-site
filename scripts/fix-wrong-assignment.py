#!/usr/bin/env python
# ============================================================
# 修正 inbox_x 里的型号归属（2026-10-22 审计 + 看图核对后）
#
# 问题：第一版 collect-blob-images.py 的 MODEL_FIX 写错，
#      rebuild-inbox.py 又从「归档文件名」反推型号，源型号信息丢失。
#
# 看图核对结论（子代理逐张看图确认）：
#   VTSB13  黑铁框 + 网格 + 篮板「Hoop Dreams」→ 与 VTSB16 封面同一台机  ✅ 归 VTSB16
#   VTSB15  紫框「B.BALL / HOOP DREAMS」       → 与 VTSB19 封面同一台机  ✅ 归 VTSB19
#   VTSA03  红桶形座椅 + 骷髅 + 木纹 DIRTY DRIVIN 招牌 → 与 VTSA035 封面同一台机 ✅ 归 VTSA035
#   VTSB14  黑框实心涂鸦侧板「Street Basketball」→ 站点无对应产品  ⏸ 暂不导入
#   VVTSB24 紫粉霓虹「SUPER HOOPS」双屏街机台      → 站点无对应产品  ⏸ 暂不导入
#
# 站点 VTSB10 / VTSB11 / VTSB12 是**儿童卡通篮球机**（蓝/天蓝/黄框），
# 与 VTSB13/14/15 完全不同的产品线 —— 原先挂到这 3 个产品上是错的，必须移出。
#
# 定位方式：源文件在 X 盘读不了内容，但「大小」可读；blob 副本与源文件字节数一致
#           → 用「大小」定位 blob，再用 sha256 与 inbox 文件比对。
#
# 用法：python scripts/fix-wrong-assignment.py
# ============================================================
import os, re, json, shutil, hashlib
from collections import defaultdict

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
SRC = r"X:\Z01_Alycia个人资料\游戏机业务\VEETOPAMUSEMNT.COM\Products\All"
BLOB = r"C:\Users\den\.workbuddy\blobs"
INBOX = os.path.join(WORK, "inbox_x")
MANIFEST = os.path.join(WORK, "_jobs", "inbox_manifest.json")

VALID = (".png", ".jpg", ".jpeg")

# 源型号 → 正确站点 slug
CORRECT = {
    "VTSB13": "vtsb16-street-basketball-machine-unfolding-folding",
    "VTSB15": "vtsb19-interactive-display-basketball-unfolding-folding",
    "VTSA03": "vtsa035-dirty-driving-42-car-racing",
}

# 站点无对应产品，本次不导入
NO_PRODUCT = {
    "VTSB14":  "站点无「黑框实心涂鸦 Street Basketball」这一款",
    "VVTSB24": "站点无「SUPER HOOPS 双屏霓虹街机篮球台」",
}


def sha(p):
    return hashlib.sha1(open(p, "rb").read()).hexdigest()


def src_model(fn):
    return re.sub(r"\s*\(\d+\)\s*", "", os.path.splitext(fn)[0]).strip().upper()


def main():
    manifest = json.load(open(MANIFEST, encoding="utf-8"))

    # 1) 源文件：大小 → [文件名]
    sz2f = defaultdict(list)
    for f in os.listdir(SRC):
        if not f.lower().endswith(VALID):
            continue
        sz2f[os.path.getsize(os.path.join(SRC, f))].append(f)

    # 2) blob：大小 → [路径]
    size2blob = defaultdict(list)
    for d, _, fs in os.walk(BLOB):
        for bf in fs:
            if not bf.lower().endswith(VALID):
                continue
            p = os.path.join(d, bf)
            try:
                size2blob[os.path.getsize(p)].append(p)
            except OSError:
                pass

    # 3) inbox 文件：hash → 文件名
    inbox_hash = {}
    for f in os.listdir(INBOX):
        p = os.path.join(INBOX, f)
        if os.path.isfile(p):
            try:
                inbox_hash[sha(p)] = f
            except OSError:
                pass

    # 4) 源文件 → inbox 文件
    src2inbox = {}
    for sz, files in sz2f.items():
        for f in files:
            m = src_model(f)
            if m not in CORRECT and m not in NO_PRODUCT:
                continue
            for bp in size2blob.get(sz, []):
                try:
                    h = sha(bp)
                except OSError:
                    continue
                if h in inbox_hash:
                    src2inbox[f] = inbox_hash[h]
                    break

    move, drop = [], []
    for f, inb in sorted(src2inbox.items()):
        m = src_model(f)
        if m in CORRECT:
            move.append((f, inb, CORRECT[m], m))
        else:
            drop.append((f, inb, m))

    print(f"定位到需改判: {len(move)} 张")
    for f, inb, slug, m in move:
        print(f"  {f:<20} ({inb}) → {slug}")
    print(f"\n需移出（站点无对应产品）: {len(drop)} 张")
    for f, inb, m in drop:
        print(f"  {f:<20} ({inb})  {NO_PRODUCT[m]}")

    if not move and not drop:
        print("\n无需改动")
        return

    # 5) 改判：重命名 + 更新 manifest
    used = defaultdict(int)
    for k, v in manifest.items():
        slug = v.get("slug")
        if not slug:
            continue
        base = os.path.splitext(k)[0]
        try:
            n = int(base.rsplit("-", 1)[1])
        except (ValueError, IndexError):
            n = 0
        used[slug] = max(used[slug], n)

    new_manifest = {k: v for k, v in manifest.items()
                    if k not in {i for _, i, _, _ in move} | {i for _, i, _ in drop}}

    for f, inb, slug, m in move:
        used[slug] += 1
        ext = os.path.splitext(inb)[1].lower()
        newname = f"{slug}-{used[slug]}{ext}"
        sp, dp = os.path.join(INBOX, inb), os.path.join(INBOX, newname)
        if os.path.exists(dp):
            os.remove(dp)
        shutil.move(sp, dp)
        rec = dict(manifest.get(inb, {}))
        rec.update({"model": slug, "src_model": m, "slug": slug, "dest": newname})
        new_manifest.pop(inb, None)
        new_manifest[newname] = rec
        print(f"  ✓ {inb} → {newname}")

    # 6) 移出的：物理文件留在 inbox_x（改名标记），manifest 移除
    for f, inb, m in drop:
        newname = inb.replace("-", f"_noproduct_{m.lower()}-", 1)
        sp, dp = os.path.join(INBOX, inb), os.path.join(INBOX, newname)
        if os.path.exists(sp):
            if os.path.exists(dp):
                os.remove(dp)
            shutil.move(sp, dp)
        new_manifest.pop(inb, None)
        print(f"  ⏸ {inb} → {newname}")

    json.dump(new_manifest, open(MANIFEST, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # 7) 汇总
    from collections import Counter
    c = Counter(v.get("slug") for v in new_manifest.values())
    print(f"\nmanifest: {len(new_manifest)} 张，覆盖 {len(c)} 个 slug")
    noproduct = [k for k in os.listdir(INBOX) if "_noproduct_" in k]
    print(f"标记为无对应产品（保留待用）: {len(noproduct)} 张")


if __name__ == "__main__":
    main()
