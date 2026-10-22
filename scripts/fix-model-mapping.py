#!/usr/bin/env python
# ============================================================
# 按「图片内容人工核对」修正型号映射，并把 inbox_x 里错位的文件
# 重新归位到正确型号。
#
# 依据（逐张看图核对）：
#   VTKR10  → 红色 3D 儿童车（与站点 vtkr108-3d-car 同款）
#   VTKR109 → 粉色心形 Happy Childhood 转马（同 vtkr108-happy-childhood-3p）
#   VTRA01  → 涂鸦街机 → 站点 VTRA010 (10-supreme-arcade-twins)
#   VTSA01  → 极速摩托 → 站点 VTSA010 (super-bike-iii)
#   VTSA03  → Dirty Drivin 越野摩托 → 站点 VTSA035 (dirty-driving-42-car-racing)
#   VTSB13  → BlackBall 黑框篮球机 → 站点 VTSB16 (street-basketball)
#   VTSB14  → Street Basketball 黑框涂鸦篮球机 → 站点 VTSB16
#   VTSB15  → HOOP DREAMS 紫框篮球机 → 站点 VTSB19
#   VTSP011 → 终极大拳 Ultimate Big Punch → 站点 VTSP003
#   VTSB020 → 与 VTSB13 同款（不同角度）
#   VVTSB24 → Super Hoops 蓝框篮球机 → 站点 VTSB19 同系列
# ============================================================
import os, re, shutil, json
from collections import defaultdict

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
INBOX = os.path.join(WORK, "inbox_x")

# 源型号 → 站点型号
MODEL_FIX = {
    "VTKR10":  "VTKR108",   # 红色 3D 儿童车
    "VTKR109": "VTKR108",   # Happy Childhood 转马（同 vtkr108 两条记录）
    "VTRA01":  "VTRA010",
    "VTSA01":  "VTSA010",
    "VTSA03":  "VTSA035",   # Dirty Drivin
    "VTSB13":  "VTSB16",
    "VTSB14":  "VTSB16",
    "VTSB15":  "VTSB19",
    "VTSB020": "VTSB16",
    "VVTSB24": "VTSB19",
    "VTSP011": "VTSP003",
}

VALID = (".png", ".jpg", ".jpeg", ".webp")


def main():
    if not os.path.isdir(INBOX):
        print("inbox_x 不存在")
        return

    files = sorted(f for f in os.listdir(INBOX) if f.lower().endswith(VALID))
    print(f"当前 inbox_x: {len(files)} 张")

    # 解析现有文件名 → (原型号, 序号)
    # 命名形如 VTKR0102-1.png（站点型号-序号）
    items = []
    for f in files:
        base, ext = os.path.splitext(f)
        if "-" not in base:
            continue
        model, num = base.rsplit("-", 1)
        if not num.isdigit():
            continue
        items.append((f, model.upper(), int(num), ext))

    # 站点型号表
    import glob
    site = {}
    for p in glob.glob(os.path.join(WORK, "data", "products", "*.json")):
        try:
            d = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue
        site[str(d.get("model", "")).strip().upper()] = d["slug"]

    # 需要重映射的：文件名里的型号在 MODEL_FIX 里
    remap = defaultdict(list)
    for f, model, num, ext in items:
        if model in MODEL_FIX:
            remap[model].append((f, num, ext))
        else:
            remap[model].append((f, num, ext))

    # 目标型号下已有的最大序号
    used = defaultdict(int)
    for model, lst in remap.items():
        for f, num, ext in lst:
            used[model] = max(used[model], num)

    moved = 0
    for src_model, lst in sorted(remap.items()):
        if src_model not in MODEL_FIX:
            continue
        dst_model = MODEL_FIX[src_model]
        # 站点确实有这个型号
        if dst_model not in site:
            print(f"⚠️ {src_model} → {dst_model} 站点无此型号，跳过")
            continue
        for f, num, ext in lst:
            used[dst_model] += 1
            newname = f"{dst_model.lower()}-{used[dst_model]}{ext}"
            if newname == f:
                continue
            src = os.path.join(INBOX, f)
            dst = os.path.join(INBOX, newname)
            if os.path.exists(dst):
                os.remove(dst)
            shutil.move(src, dst)
            moved += 1

    print(f"✅ 重映射完成，移动 {moved} 个文件")

    # 最终统计
    final = defaultdict(list)
    for f in sorted(os.listdir(INBOX)):
        if not f.lower().endswith(VALID):
            continue
        base, ext = os.path.splitext(f)
        model = base.rsplit("-", 1)[0].upper() if "-" in base else base.upper()
        final[model].append(f)

    print(f"\n最终: {len(final)} 个型号, {sum(len(v) for v in final.values())} 张")
    hit = [m for m in final if m in site]
    miss = [m for m in final if m not in site]
    print(f"✅ 站点可匹配: {len(hit)}  ⚠️ 无对应: {len(miss)} {miss}")

    # 输出最终映射表
    out = {}
    for m in sorted(final):
        out[m] = {"slug": site.get(m), "count": len(final[m]), "files": final[m]}
    json.dump(out, open(os.path.join(WORK, "_jobs", "final_map.json"), "w",
                        encoding="utf-8"), ensure_ascii=False, indent=1)
    print("映射表已写入 _jobs/final_map.json")


if __name__ == "__main__":
    main()
