#!/usr/bin/env python
"""全量校验新建文章：front-matter、词数、表格、内链、配图、事实性红线。"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ART = ROOT / "data" / "articles"
PUB = ROOT / "public"

NEW = [
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

OK_PRODUCTS = {
    "arcade-video-games", "sports-skill-games", "redemption-ticket-games",
    "claw-crane-machines", "kiddie-rides", "prize-merchandisers",
}
REAL_ARTICLES = {p.stem for p in ART.glob("*.md")}

# 禁止出现的错误表述（CE 自我声明 / NB 证书等）
# 注意：只在"断言句"中判定；误区澄清句（如"There is no expiry"）不算违规，
# 因此对每条命中再检查所在行是否含否定/澄清标记。
BANNED = [
    (r"NB\s+certificate", "宣称 NB 证书"),
    (r"NB\s+certified", "宣称 NB 认证"),
    (r"we\s+provide\s+NB", "宣称提供 NB"),
    (r"third[- ]party\s+CE\s+certificate", "宣称第三方 CE 证书"),
    (r"CE\s+certificate\s+issued\s+by", "宣称 CE 证书由第三方签发"),
    (r"certificate\s+expire", "证书过期概念"),
    (r"renew\s+(your\s+)?CE\s+certificate", "CE 证书续期概念"),
]
# 命中后若同行含这些词，视为"误区澄清"而非错误宣称
CLEARING = re.compile(
    r"no\s+expiry|does\s+not\s+expire|myth|actually|not\s+what\s+it\s+is|"
    r"no\s+certificate\s+to\s+buy|there\s+is\s+no|is\s+not\s+required|"
    r"must\s+not\s+be\s+renewed|do\s+not\s+expire|misconception|wrong|"
    r"not\s+a\s+real\s+document|self[- ]declar|per\s+model",
    re.I,
)

problems = []
rows = []
all_words = 0

for slug in NEW:
    f = ART / f"{slug}.md"
    if not f.exists():
        problems.append(f"[MISSING] {slug}.md 不存在")
        continue
    raw = f.read_text(encoding="utf-8")

    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$", raw)
    if not m:
        problems.append(f"[FM] {slug}: front-matter 解析失败")
        continue
    fm_raw, body = m.group(1), m.group(2)

    fm = {}
    for line in fm_raw.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        fm[k.strip()] = v.strip().strip('"').strip("'")

    for key in ("slug", "section", "title", "summary", "date", "image", "imageAlt", "tag"):
        if key not in fm or not fm[key]:
            problems.append(f"[FM] {slug}: 缺字段 {key}")

    if fm.get("slug") != slug:
        problems.append(f"[FM] {slug}: slug 字段与文件名不一致 -> {fm.get('slug')}")
    if fm.get("section") != "guide":
        problems.append(f"[FM] {slug}: section 应为 guide -> {fm.get('section')}")
    if len(fm.get("title", "")) > 60:
        problems.append(f"[FM] {slug}: title {len(fm['title'])} 字符 > 60")
    if not (150 <= len(fm.get("summary", "")) <= 200):
        problems.append(f"[FM] {slug}: summary {len(fm.get('summary',''))} 字符不在 150-200")

    # H1 与 title 一致
    h1 = re.search(r"^#\s+(.+)$", body, re.M)
    if not h1:
        problems.append(f"[H1] {slug}: 正文缺少 # 一级标题")
    elif h1.group(1).strip() != fm.get("title", "").strip():
        problems.append(f"[H1] {slug}: H1 与 title 不一致")

    words = len(re.findall(r"[A-Za-z][A-Za-z'-]*", body))
    all_words += words
    if not (1400 <= words <= 1900):
        problems.append(f"[LEN] {slug}: {words} 词不在 1400-1900")

    tables = len(re.findall(r"^\|\s*:?-{2,}", body, re.M))
    if tables < 2:
        problems.append(f"[TBL] {slug}: 仅 {tables} 个表格 < 2")

    h2 = len(re.findall(r"^##\s+", body, re.M))

    # 产品内链白名单
    for link in re.findall(r"\]\(/products/([^/]+)/\)", body):
        if link not in OK_PRODUCTS:
            problems.append(f"[LINK] {slug}: /products/{link}/ 不在白名单")

    # 博客内链必须指向真实文章
    for link in re.findall(r"\]\(/blog/([^/]+)/\)", body):
        if link not in REAL_ARTICLES:
            problems.append(f"[LINK] {slug}: /blog/{link}/ 目标文章不存在")

    # 配图存在
    img = fm.get("image", "")
    if img.startswith("/"):
        p = PUB / img.lstrip("/")
        if not p.exists():
            problems.append(f"[IMG] {slug}: 配图不存在 {img}")
    else:
        problems.append(f"[IMG] {slug}: image 路径格式异常 {img}")

    # 交期口径
    if "5-25 days" not in body:
        problems.append(f"[LEAD] {slug}: 未写 5-25 days 交期")

    # 事实性红线（逐行判定，误区澄清句不算违规）
    for pat, label in BANNED:
        for line in body.splitlines():
            if re.search(pat, line, re.I) and not CLEARING.search(line):
                problems.append(f"[FACT] {slug}: 命中禁用表述「{label}」-> {line.strip()[:90]}")

    # CTA
    if "/contact/" not in body:
        problems.append(f"[CTA] {slug}: 缺 /contact/ 链接")

    rows.append((slug, words, tables, h2, len(fm.get("title", ""))))

REPORT = ROOT / "scripts" / "_check_articles.txt"
_buf: list[str] = []


def emit(line: str = "") -> None:
    _buf.append(line)


emit("=" * 100)
emit(f"{'slug':<62} {'words':>6} {'tbl':>4} {'h2':>4} {'title':>6}")
emit("=" * 100)
for slug, w, t, h, tl in rows:
    emit(f"{slug:<62} {w:>6} {t:>4} {h:>4} {tl:>6}")
emit("=" * 100)
emit(f"合计 {len(rows)}/11 篇，总词数 {all_words}")
emit("")
if problems:
    emit(f"❌ 发现 {len(problems)} 个问题：")
    for p in problems:
        emit("  - " + p)
    RESULT = 1
else:
    emit("✅ 全部校验通过")
    RESULT = 0

REPORT.write_text("\n".join(_buf), encoding="utf-8")
sys.exit(RESULT)
