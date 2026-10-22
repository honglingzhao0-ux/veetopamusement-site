#!/usr/bin/env python
# ============================================================
# 审计：inbox_x 里每个文件究竟来自哪个源文件，型号归属是否正确
#
# 原理：blob 的 png 与源文件字节数完全一致 → 可用「大小 + 内容哈希」
#       精确反查源文件名。inbox 文件也是 blob 的副本，内容哈希一致。
#
# 查两类问题：
#   A) 源型号 ≠ 目标型号（挂错产品）
#   B) 某个源型号的一张图都没进 manifest（漏图）
# ============================================================
import os, re, json, hashlib
from collections import defaultdict

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
SRC = r"X:\Z01_Alycia个人资料\游戏机业务\VEETOPAMUSEMNT.COM\Products\All"
BLOB = r"C:\Users\den\.workbuddy\blobs"
INBOX = os.path.join(WORK, "inbox_x")
MANIFEST = os.path.join(WORK, "_jobs", "inbox_manifest.json")


def sha(p):
    return hashlib.sha1(open(p, "rb").read()).hexdigest()


def src_model(fn):
    """源文件名 → 型号（去掉 (1) 这类副本后缀）"""
    return re.sub(r"\s*\(\d+\)\s*", "", os.path.splitext(fn)[0]).strip().upper()


def main():
    VALID = (".png", ".jpg", ".jpeg")

    # 1) 源文件：大小 → [文件名]；型号 → [文件名]
    sz2f = defaultdict(list)
    model2f = defaultdict(list)
    for f in os.listdir(SRC):
        if not f.lower().endswith(VALID):
            continue
        sz = os.path.getsize(os.path.join(SRC, f))
        sz2f[sz].append(f)
        model2f[src_model(f)].append(f)

    # 2) blob：哈希 → 路径（先建 size → 候选 blob，再建 hash）
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

    # 3) 内容哈希 → 源文件名（用大小定位候选源，再用 hash 精确匹配）
    #    源文件内容读不了 → 只能靠「大小 + blob 副本」间接匹配。
    #    做法：源文件大小 → blob 中同大小文件 → 这些 blob 的 hash 就是该源文件的 hash。
    hash2src = {}
    for sz, files in sz2f.items():
        if len(files) != 1:
            continue          # 大小撞车的源文件靠模型名兜底
        f = files[0]
        for bp in size2blob.get(sz, []):
            try:
                h = sha(bp)
            except OSError:
                continue
            hash2src.setdefault(h, f)

    # 4) 逐个 inbox 文件追溯
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    by_hash = {}
    for f in os.listdir(INBOX):
        p = os.path.join(INBOX, f)
        if os.path.isfile(p):
            try:
                by_hash[sha(p)] = f
            except OSError:
                pass

    # 源文件 → 实际归属的 inbox 文件
    src2dest = defaultdict(list)
    for h, f in by_hash.items():
        if h in hash2src:
            src2dest[hash2src[h]].append(f)

    # 5) 审计
    manifest_models = defaultdict(int)
    for k, v in manifest.items():
        manifest_models[v.get("src_model", "?")] += 1

    print("=" * 74)
    print("审计报告：源文件 → inbox 归属")
    print("=" * 74)

    A_mismatch = []
    B_missing = []
    for model in sorted(model2f):
        files = model2f[model]
        dests = []
        for f in files:
            dests.extend(src2dest.get(f, []))
        got = len(dests)
        # 这些源文件的内容在 inbox 里的归属型号
        dest_models = set()
        for d in dests:
            base = os.path.splitext(d)[0]
            dest_models.add(base.rsplit("-", 1)[0].upper())

        if got == 0:
            B_missing.append((model, len(files)))
        elif model not in dest_models:
            A_mismatch.append((model, dest_models, got))

    print(f"\n源型号总数: {len(model2f)}    源文件总数: {sum(len(v) for v in model2f.values())}")
    print(f"inbox 文件数: {len(by_hash)}")

    print(f"\n{'='*74}\n【A】挂错产品：源型号 X 的图被放到了型号 Y\n{'='*74}")
    if A_mismatch:
        for m, dm, n in A_mismatch:
            print(f"  源 {m:<12} ({n} 张) → 实际在 {sorted(dm)}")
    else:
        print("  无")

    print(f"\n{'='*74}\n【B】完全漏图：源型号 X 的图一张都没进 inbox\n{'='*74}")
    if B_missing:
        for m, n in B_missing:
            print(f"  源 {m:<12} ({n} 张)  →  inbox 中 0 张")
    else:
        print("  无")

    json.dump({m: [list(x) for x in src2dest.get(f, [])]
               for f in [x for v in model2f.values() for x in v]},
              open(os.path.join(WORK, "_jobs", "src2dest.json"), "w",
                   encoding="utf-8"), ensure_ascii=False, indent=1)
    print("\n追溯表已写入 _jobs/src2dest.json")


if __name__ == "__main__":
    main()
