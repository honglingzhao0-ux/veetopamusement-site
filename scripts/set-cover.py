#!/usr/bin/env python
# ============================================================
# 指定新封面：把指定图提到 images[0]，原封面下移保留
#
# 用途：产品列表页卡片 / 首页 Flagship / OG 分享图都用 images[0]，
#       所以换封面 = 换 images[0]。其余图保留在数组里（详情页仍可翻看）。
#
# 用法：python scripts/set-cover.py
# ============================================================
import os, json

WORK = r"C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site"
PUB = os.path.join(WORK, "public", "images", "products")

# slug → 新的封面文件名（放在 public/images/products/ 下）
NEW_COVER = {
    "vtsp006-boxing-ia":                "vtsp006-boxing-ia-16.jpeg",
    "vtsp007-boxing-ib":                "vtsp007-boxing-ib-20.jpeg",
    "vtsp008-boxing-ii":                "vtsp008-boxing-ii-3.jpeg",
    "vtsp009a-punching-kicking-iia":    "vtsp009a-punching-kicking-iia-2.jpeg",
    "vtsp009b-punching-kicking-iib":    "vtsp009b-punching-kicking-iib-9.jpeg",
}


def main():
    for slug, cover_name in NEW_COVER.items():
        pj = os.path.join(WORK, "data", "products", f"{slug}.json")
        if not os.path.exists(pj):
            print(f"❌ 找不到 {slug}.json")
            continue

        data = json.load(open(pj, encoding="utf-8"))
        imgs = list(data.get("images", []))
        if not imgs:
            print(f"❌ {slug}: images 为空")
            continue

        target = f"/images/products/{cover_name}"
        if target not in imgs:
            print(f"❌ {slug}: 新封面 {cover_name} 不在 images 里")
            continue
        if imgs[0] == target:
            print(f"=  {slug}: 已是该封面，无需改动")
            continue

        old = imgs[0]
        imgs.remove(target)
        imgs.insert(0, target)
        data["images"] = imgs
        json.dump(data, open(pj, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

        print(f"✓ {slug}")
        print(f"    旧封面 {old.split('/')[-1]}  → 位置 {imgs.index(old)+1}")
        print(f"    新封面 {cover_name}  → 位置 1")
        print(f"    共 {len(imgs)} 张图（详情页可翻看全部）")

    print("\n下一步：bash publish.sh \"更新 5 个 Boxing 产品封面\"")


if __name__ == "__main__":
    main()
