#!/usr/bin/env python
# ============================================================
# 黑底产品图批量修复：把纯黑背景（含抠图残留黑板）替换为**纯白背景**
#
# 设计目标（对应公司后续"补真实白底照片"的选型）：
#   修复后的图与真实白底实拍图风格一致 —— 都是干净纯白底、无渐变过渡，
#   这样以后逐张替换为真实照片时，卡片视觉不会有"两套底色"的割裂感。
#
# 原理：
#   这批图是"纯黑背景板"上摆拍的抠图，纯黑占比约 70%。
#   JPEG 在黑边界会产生彩色振铃噪声（红蓝边），因此不能只看亮度低，
#   必须同时要求接近中性灰，否则边缘彩噪会被一起提亮，出现彩色描边。
#     暗且近中性灰  → 纯白（#fff）
#     亮或偏彩色    → 原样保留（产品主体、彩灯、贴纸不受影响）
#
# 用法：
#   python scripts/fix-dark-bg.py --preview   # 生成预览，不动原图
#   python scripts/fix-dark-bg.py --apply     # 写回原图（会先自动备份到 _backup_images_black/）
# ============================================================
import os, sys, shutil
from PIL import Image

SRC = "public/images/products"
PREVIEW_DIR = os.path.join(SRC, "_fixed_preview")
BACKUP_DIR = "_backup_images_black"

# 已知黑底图清单（2026-10-20 扫描得出：vttr060~vttr076 连续一段，边缘暗像素 100%）
BLACK_LIST = [
    "vttr060-crack-the-cube.jpeg", "vttr061-minions-wheel.jpeg",
    "vttr062-minions-carnival-chaos.jpeg", "vttr063-pop-the-lock.jpeg",
    "vttr064-piano-keys.jpeg", "vttr065-crossy.jpeg",
    "vttr066-flappy-bird.jpeg", "vttr067-luck-quick-drop.jpeg",
    "vttr068-lucky-fish-bowl.jpeg", "vttr069-lucky-fish-bowl-1-group.jpeg",
    "vttr070-sonic-dash.jpeg", "vttr071-stack-ticket.jpeg",
    "vttr072-subway-surfers.jpeg", "vttr073-rail-rush.jpeg",
    "vttr074-55-flappy-bird-hd.jpeg", "vttr075-55-stack-ticket-hd.jpeg",
    "vttr076-55-crossy-hd.jpeg",
]

# 阈值：低于 LUM_MAX 且通道极差小于 MAX_SAT 视为"暗且中性"→ 置白
LUM_MAX = 118
MAX_SAT = 42


def convert(im):
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()
    out = im.copy()
    opx = out.load()

    for y in range(h):
        for x in range(w):
            pr, pg, pb = px[x, y]
            lum = max(pr, pg, pb)
            sat = lum - min(pr, pg, pb)
            if lum < LUM_MAX and sat < MAX_SAT:
                opx[x, y] = (255, 255, 255)
    return out


def main():
    apply = "--apply" in sys.argv
    preview = "--preview" in sys.argv or not apply

    if preview:
        os.makedirs(PREVIEW_DIR, exist_ok=True)

    if apply:
        os.makedirs(BACKUP_DIR, exist_ok=True)

    done = 0
    for fn in BLACK_LIST:
        p = os.path.join(SRC, fn)
        if not os.path.exists(p):
            print(f"  ⚠️  跳过（文件不存在）: {fn}")
            continue
        res = convert(Image.open(p))
        if apply:
            shutil.copy2(p, os.path.join(BACKUP_DIR, fn))   # 先备份再覆盖
            res.save(p, "JPEG", quality=92, optimize=True)
            print(f"  ✅ 已修复: {fn}")
        else:
            res.save(os.path.join(PREVIEW_DIR, fn), "JPEG", quality=92)
            print(f"  🔍 预览: {fn}")
        done += 1

    if apply:
        print(f"\n共处理 {done} 张，已写回原图。原图备份在：{BACKUP_DIR}/")
    else:
        print(f"\n共处理 {done} 张。模式：仅预览（预览目录：{PREVIEW_DIR}）")


if __name__ == "__main__":
    main()