#!/usr/bin/env python
# ============================================================
# 从 blob 全量收集 Read 工具复制出的原图，按型号归档到 inbox_x/
#
# 原理：Read 工具读取 X 盘（网络盘）文件时，会把原图复制到
#   C:\Users\den\.workbuddy\blobs\<xx>\<hash>.png
# 同时生成一个 .jpg 缩略图（忽略）。blob 的 png 与源文件
# **字节数完全一致**（已实测差 0KB），因此可用「文件大小」
# 精确反查源文件。
#
# 设计要点：
#   - 全量扫描 blob（不依赖增量状态），可重复运行、并发安全
#   - 同型号多张图按 model-1 / model-2 顺序编号
#   - 已归档的跳过（幂等）
#
# 用法：python scripts/collect-blob-images.py
# ============================================================
import os, re, json, shutil, glob
from collections import defaultdict

BLOB_ROOT = r"C:\Users\den\.workbuddy\blobs"
SRC_DIR = r"X:\Z01_Alycia个人资料\游戏机业务\VEETOPAMUSEMNT.COM\Products\All"
WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
INBOX = os.path.join(WORK, "inbox_x")
MANIFEST = os.path.join(WORK, "_jobs", "collected.json")

VALID_EXT = (".png", ".jpg", ".jpeg", ".webp")

# 源文件型号 → 站点型号 的修正映射（依据图片内容人工核对）
# 站点型号 = 该型号在 data/products/*.json 里的 model 字段值
MODEL_FIX = {
    "VTKR10":  "VTKR010",   # 红色摩托（少一位零）
    "VTRA01":  "VTRA010",   # 涂鸦街机
    "VTSA01":  "VTSA010",   # 极速摩托
    "VTSA03":  "VTSA030",   # 越野摩托 → razing store? 待人工确认
    "VTSB13":  "VTSB10",    # 篮球机（红黑配色）
    "VTSB14":  "VTSB11",    # 篮球机（街头涂鸦配色）
    "VTSB15":  "VTSB12",    # 篮球机（紫 HOOP DREAMS 配色）
    "VTSP011": "VTSP003",   # 终极大拳（boxing punching kicking）
}


def model_of(fn):
    """从源文件名提取型号：去掉 (1) 这类副本后缀与扩展名"""
    b = os.path.splitext(fn)[0]
    b = re.sub(r"\s*\(\d+\)\s*", "", b)
    return b.strip()


def blob_pngs():
    """所有 blob 原图 {大小: [路径]}"""
    out = defaultdict(list)
    for d, _, fs in os.walk(BLOB_ROOT):
        for f in fs:
            if not f.lower().endswith(".png"):
                continue
            p = os.path.join(d, f)
            try:
                out[os.path.getsize(p)].append(p)
            except OSError:
                pass
    return out


def main():
    os.makedirs(INBOX, exist_ok=True)
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)

    # 源文件：大小 → [文件名]（只保留大小唯一的，能精确反查）
    by_size = defaultdict(list)
    all_files = []
    for f in os.listdir(SRC_DIR):
        if not f.lower().endswith(VALID_EXT):
            continue
        try:
            sz = os.path.getsize(os.path.join(SRC_DIR, f))
        except OSError:
            continue
        by_size[sz].append(f)
        all_files.append(f)

    # 源文件里：型号 → 该型号所有文件名（按文件名排序，保证顺序稳定）
    by_model = defaultdict(list)
    for f in sorted(all_files):
        by_model[model_of(f)].append(f)

    blobs = blob_pngs()

    # 已归档记录（旧版可能是 list 格式，兼容处理）
    manifest = {}
    if os.path.exists(MANIFEST):
        try:
            raw = json.load(open(MANIFEST, encoding="utf-8"))
            if isinstance(raw, list):
                for it in raw:
                    if isinstance(it, dict) and "src" in it:
                        manifest[it["src"]] = it
            elif isinstance(raw, dict):
                manifest = raw
        except Exception:
            manifest = {}

    # 找出所有可被 blob 命中的源文件
    hit = {}   # 源文件名 → blob 路径
    ambiguous = []   # 大小撞车，跳过
    for f in all_files:
        sz = os.path.getsize(os.path.join(SRC_DIR, f))
        cands = by_size[sz]
        if len(cands) != 1:
            ambiguous.append(f)
            continue
        for bp in blobs.get(sz, []):
            if bp not in hit.values():
                hit[f] = bp
                break

    # 按型号分组归档
    copied = 0
    for model, files in by_model.items():
        site_model = MODEL_FIX.get(model.upper(), model.upper())
        for f in files:
            if f not in hit:
                continue
            ext = os.path.splitext(f)[1].lower()
            # 目标名：{站点型号小写}-{序号}.{ext}
            idx = 1
            while True:
                dest = os.path.join(INBOX, f"{site_model.lower()}-{idx}{ext}")
                if not os.path.exists(dest):
                    break
                idx += 1
            shutil.copy2(hit[f], dest)
            manifest[f] = {
                "model": model,
                "site_model": site_model,
                "dest": os.path.basename(dest),
                "size": os.path.getsize(hit[f]),
            }
            copied += 1

    json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    total = len(all_files)
    got = len(manifest)
    models_done = len({v["site_model"] for v in manifest.values()})
    print(f"✅ 本轮新增 {copied} 张；累计 {got}/{total} 张，覆盖 {models_done} 个型号")
    if ambiguous:
        print(f"⚠️ 大小撞车跳过 {len(ambiguous)} 个: {ambiguous[:6]}")
    miss = [f for f in all_files if f not in manifest]
    if miss:
        print(f"⏳ 尚未读取 {len(miss)} 张")


if __name__ == "__main__":
    main()
