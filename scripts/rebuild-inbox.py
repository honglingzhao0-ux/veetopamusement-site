#!/usr/bin/env python
# ============================================================
# 重建干净的 inbox_x：
#   1. 按内容哈希去重（收集器重复运行会产生副本）
#   2. 同一型号内按「内容唯一化」保留，序号重排为 -1, -2, -3...
#   3. 应用人工核对的型号映射
#
# 人工核对结论（逐张看图）：
#   VTKR10  → 红色 3D 儿童车 → 站点 vtkr108-3d-car
#   VTKR109 → 粉色心形 Happy Childhood 转马 → 站点 vtkr108-happy-childhood-3p
#   VTRA01  → 涂鸦街机 → VTRA010
#   VTSA01  → 极速摩托 → VTSA010
#   VTSA03  → Dirty Drivin 越野摩托 → VTSA035
#   VTSB13  → BlackBall 黑框篮球机 → VTSB16
#   VTSB14  → Street Basketball 涂鸦篮球机 → VTSB16
#   VTSB15  → HOOP DREAMS 紫框篮球机 → VTSB19
#   VTSB020 → 同 VTSB13 → VTSB16
#   VVTSB24 → Super Hoops 蓝框篮球机 → VTSB19
#   VTSP011 → 终极大拳 → VTSP003
# ============================================================
import os, re, shutil, json, glob, hashlib
from collections import defaultdict

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
INBOX = os.path.join(WORK, "inbox_x")
TMP = os.path.join(WORK, "_jobs", "inbox_clean")

# 源型号 → 站点型号
MODEL_FIX = {
    "VTKR10":  "VTKR108",
    "VTKR109": "VTKR108",
    "VTRA01":  "VTRA010",
    "VTSA01":  "VTSA010",
    "VTSA03":  "VTSA035",
    "VTSB13":  "VTSB16",
    "VTSB14":  "VTSB16",
    "VTSB15":  "VTSB19",
    "VTSB020": "VTSB16",
    "VVTSB24": "VTSB19",
    "VTSP011": "VTSP003",
}

# VTKR108 有两条站点记录（3d-car 与 happy-childhood-3p），
# 按内容区分：红车 → 3d-car，转马 → happy-childhood-3p
# 用「现有封面图内容」做锚点：先看站点现有图是哪种外观
# → 红色摩托（VTKR10）        → vtkr108-3d-car
# → 粉色心形转马（VTKR109）   → vtkr108-happy-childhood-3p
VTKR108_SPLIT = {
    "VTKR10":  "vtkr108-3d-car",
    "VTKR109": "vtkr108-happy-childhood-3p",
}

VALID = (".png", ".jpg", ".jpeg", ".webp")


def main():
    if not os.path.isdir(INBOX):
        print("inbox_x 不存在")
        return
    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)

    files = sorted(f for f in os.listdir(INBOX) if f.lower().endswith(VALID))

    # 站点 slug 表
    site = {}
    for p in glob.glob(os.path.join(WORK, "data", "products", "*.json")):
        try:
            d = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue
        site[str(d.get("model", "")).strip().upper()] = d["slug"]

    # 1) 内容去重，保留每种内容第一次出现的文件名
    seen = {}
    uniq = []          # [(文件名, 型号)]
    for f in files:
        p = os.path.join(INBOX, f)
        h = hashlib.sha1(open(p, "rb").read()).hexdigest()
        if h in seen:
            continue
        seen[h] = f
        base, ext = os.path.splitext(f)
        model = base.rsplit("-", 1)[0].upper() if "-" in base else base.upper()
        uniq.append((f, model, h))

    print(f"输入 {len(files)} 张 → 去重后 {len(uniq)} 张唯一内容")

    # 2) 应用映射 + 重排序号
    by_model = defaultdict(list)
    for f, model, h in uniq:
        target = MODEL_FIX.get(model, model)
        by_model[target].append((f, model, h))

    manifest = {}
    for target, lst in sorted(by_model.items()):
        if target not in site:
            print(f"⚠️ {target} 站点无对应型号，跳过 {len(lst)} 张")
            continue
        for i, (f, srcmodel, h) in enumerate(lst, 1):
            ext = os.path.splitext(f)[1].lower()
            newname = f"{target.lower()}-{i}{ext}"
            shutil.copy2(os.path.join(INBOX, f), os.path.join(TMP, newname))
            manifest[newname] = {"src": f, "model": target, "src_model": srcmodel}

    # 3) 交换到 inbox_x（先备份旧的）
    BAK = INBOX + ".bak-" + "20261022"
    if os.path.isdir(BAK):
        shutil.rmtree(BAK)
    shutil.move(INBOX, BAK)
    shutil.move(TMP, INBOX)
    print(f"旧 inbox_x 已备份至 {os.path.basename(BAK)}")

    # 4) VTKR108 拆分为两个 slug
    vk = [k for k in manifest if k.startswith("vtkr108-")]
    if vk:
        for k in vk:
            rec = manifest[k]
            if rec["src_model"] == "VTKR10":
                rec["slug"] = VTKR108_SPLIT["VTKR10"]
            elif rec["src_model"] == "VTKR109":
                rec["slug"] = VTKR108_SPLIT["VTKR109"]
        print(f"VTKR108 拆分: " + ", ".join(
            f"{s}={sum(1 for r in manifest.values() if r.get('slug')==s)}"
            for s in set(r.get("slug") for r in manifest.values() if r.get("slug"))))

    json.dump(manifest, open(os.path.join(WORK, "_jobs", "inbox_manifest.json"), "w",
                              encoding="utf-8"), ensure_ascii=False, indent=1)

    # 汇总
    cnt = defaultdict(int)
    for k, v in manifest.items():
        cnt[v["model"]] += 1
    print(f"\n✅ 干净 inbox_x: {len(manifest)} 张，覆盖 {len(cnt)} 个型号")
    nomatch = [m for m in cnt if m not in site]
    print(f"站点可匹配 {len(cnt)-len(nomatch)}，无对应 {len(nomatch)} {nomatch}")


if __name__ == "__main__":
    main()
