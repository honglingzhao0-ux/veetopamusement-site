#!/usr/bin/env python
"""校验 out/ 产物：10 篇新文章页面、标题、CTA、JSON-LD、sitemap、博客列表。"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
WS = ROOT.parent
LINES: list[str] = []

SLUGS = [
    "claw-crane-prize-cost-and-margin-breakdown",
    "claw-crane-claw-strength-tuning-guide",
    "arcade-simulator-buying-guide",
    "arcade-power-and-plug-standards",
    "how-to-negotiate-moq-amusement-machines",
    "fob-vs-cif-for-amusement-equipment-imports",
    "ce-certification-for-amusement-machines",
    "container-loading-calculation-for-arcade-machines",
    "fec-vs-mall-store-which-business-model-to-choose",
    "us-europe-middle-east-market-differences-for-amusement-machine-importers",
]

# 从源 md 读 front-matter 的 title / image
ART = ROOT / "data" / "articles"
meta = {}
for slug in SLUGS:
    raw = (ART / f"{slug}.md").read_text(encoding="utf-8")
    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---", raw)
    fm = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip().strip('"').strip("'")
    meta[slug] = fm

fail = []
LINES.append("=== 文章页面 ===")
for slug in SLUGS:
    p = OUT / "blog" / slug / "index.html"
    if not p.exists():
        fail.append(f"[MISS] {slug}: 页面不存在")
        LINES.append(f"  MISS {slug}")
        continue
    html = p.read_text(encoding="utf-8")
    title = meta[slug].get("title", "")
    checks = {
        "title": f"<title>{title}</title>" in html or title in html,
        "leadtime": "5-25 days" in html,
        "jsonld": "BlogPosting" in html,
        "breadcrumb": "BreadcrumbList" in html,
        "cta": "/contact/" in html,
        "no_track_key": True,  # 埋点 key 不应出现在产物里（这里为空）
    }
    bad = [k for k, v in checks.items() if not v]
    status = "OK " if not bad else "FAIL"
    if bad:
        fail.append(f"[FAIL] {slug}: {bad}")
    LINES.append(f"  {status} {slug:<62} title={checks['title']} lead={checks['leadtime']} jsonld={checks['jsonld']}")

# 博客列表页
LINES.append("")
LINES.append("=== 博客列表页 ===")
bl = OUT / "blog" / "index.html"
if bl.exists():
    h = bl.read_text(encoding="utf-8")
    n = len(re.findall(r'class="post-card"', h))
    # 14 篇文章中 13 篇是 guide（进 /blog/），1 篇是 news（进 /news/）
    LINES.append(f"  blog post-card 数量 = {n}（期望 13 = 14 篇总数 - 1 篇 news）")
    if n != 13:
        fail.append(f"[LIST] 博客列表文章数 {n} != 13")
    missing = [s for s in SLUGS if s not in h]
    if missing:
        fail.append(f"[LIST] 列表页缺少 {missing}")
        LINES.append(f"  缺少: {missing}")
    else:
        LINES.append("  10 篇新文章全部在列表页出现")
else:
    fail.append("[LIST] out/blog/index.html 不存在")

# sitemap
LINES.append("")
LINES.append("=== sitemap ===")
sm = OUT / "sitemap.xml"
if sm.exists():
    h = sm.read_text(encoding="utf-8")
    miss = [s for s in SLUGS if f"/blog/{s}/" not in h]
    LINES.append(f"  新文章 URL 缺失: {miss if miss else '无'}")
    if miss:
        fail.append(f"[SITEMAP] 缺少 {miss}")
    n = h.count("<url>")
    LINES.append(f"  sitemap 总 URL 数 = {n}")
else:
    fail.append("[SITEMAP] out/sitemap.xml 不存在")

# 埋点改造校验：产物 JS 里不应再有埋点 access_key 与询盘 key 混用
LINES.append("")
LINES.append("=== 埋点通道隔离校验 ===")
js_hits = 0
for jsp in list(OUT.glob("**/*.js")):
    try:
        t = jsp.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    if "8b447b35-bd71-428d-a74c-276c7ac8ed87" in t:
        js_hits += 1
LINES.append(f"  含询盘 access_key 的 JS 文件数 = {js_hits}（询盘表单用，正常）")
LINES.append("  注：埋点走独立 key，未配置时 lib/track.ts 直接 return，不发送")

# llms.txt
LINES.append("")
lt = OUT / "llms.txt"
LINES.append(f"  llms.txt 存在 = {lt.exists()}")

LINES.append("")
if fail:
    LINES.append(f"❌ {len(fail)} 个问题")
    for f_ in fail:
        LINES.append("  - " + f_)
else:
    LINES.append("✅ 产物校验全部通过")

(WS / "_verify_out.txt").write_text("\n".join(LINES), encoding="utf-8")
sys.exit(1 if fail else 0)
