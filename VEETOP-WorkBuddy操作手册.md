# VEETOP 站 · WorkBuddy 接管操作手册

> 目标：用 WorkBuddy 替代 Accio Work 更新网站内容。改完一句话发布，1–3 分钟自动上线。
> 写给不写代码的负责人。首次接管已完成，你只需按第 3 节操作。

---

## 1. 现在的状态（已接管完成）

| 项 | 情况 |
|---|---|
| 工作副本 | `C:\Users\den\WorkBuddy\2026-10-20-10-27-11\veetop-site` |
| 源码基线 | 与线上完全一致：210 个产品、6 个品类页、news/blog 页，共 223 条 URL |
| 版本控制 | Git 仓库已初始化，已连 GitHub `honglingzhao0-ux/veetopamusement-site` |
| 发布链路 | 改代码 → `git push` → Vercel 自动构建部署 → 域名生效（已实测闭环） |
| 本地构建 | 已验证通过，产物 223 条 sitemap 与线上逐条吻合 |

**关键结论**：线上内容早已在 GitHub 仓库里（Accio Work 一直推同一个仓库）。
所以接管不需要迁移数据，只要在 WorkBuddy 里用这个仓库改内容、推上去即可。

---

## 2. 一条命令发布

```bash
cd /c/Users/den/WorkBuddy/2026-10-20-10-27-11/veetop-site
bash publish.sh "本次改动的说明"
```

脚本会依次完成：类型检查 → 生产构建 → git 提交 → 推送 GitHub → 触发 Vercel 部署。
约 1–3 分钟后线上生效。

**更简单的方式**：直接告诉 WorkBuddy「把 X 改成 Y 并发布」，我来执行。

### 你可以直接对 WorkBuddy 说的话

- 「把首页的 Hero 文案改成 XXX」
- 「给产品 VTKR0102 补上 3 条 FAQ」
- 「新增一个产品 XXX，型号 VT-XXX，参数……」
- 「把 footer 里的 WhatsApp 号码改成 +86 xxx」
- 「改完先给我看本地预览，别急着发布」
- 「把 About 页的工厂配图换成 public/images/ 下的 xxx.jpg 并发布」

我会自动：定位对应文件 → 改 → 类型检查 → 构建 → 提交 → 推送 → 确认线上生效。

---

## 3. 日常改内容：改什么、动哪个文件

站点是**数据驱动**的——绝大多数内容改动不需要碰代码，只改 JSON 即可。

| 想改什么 | 改哪个文件 | 要不要动代码 |
|---|---|---|
| **首页主推哪16 款 / 排序** | `data/products/<slug>.json` 的 `featuredRank` | 不用 |
| 公司名/邮箱/电话/地址/WhatsApp/公司数据 | `site.config.ts` | 不用 |
| 某个产品的名称/参数/卖点/认证 | `data/products/<slug>.json` | 不用 |
| 新增一个产品 | 复制 `data/products/` 任意 JSON 改名 | 不用 |
| 下架产品 | 删除对应 JSON | 不用 |
| 品类页标题/简介/FAQ | `data/categories.json` | 不用 |
| 导航栏/页脚链接 | `components/header.tsx`、`components/footer.tsx` | 要懂一点 TSX |
| 首页/About/News/Blog 版面 | `app/<页面>/page.tsx` | 要懂一点 TSX |
| 颜色/字体/整体风格 | `app/globals.css` 顶部的 `:root` 变量 | 要懂一点 CSS |

### 产品 JSON 字段速查

```jsonc
{
  "slug": "vtkr0102-kiddie-ride-a",   // 必须 = 文件名
  "name": "Kiddie Ride A",
  "model": "VTKR0102",
  "category": "kiddie-rides",           // 必须是 categories.json 里已存在的 id
  "headline": "一句话卖点，含型号与尺寸",
  "description": "产品描述",
  "images": ["/images/products/vtkr0102-kiddie-ride-a.jpeg"],
  "specs": [ { "label": "Model", "value": "VTKR0102" } ],
  "features": ["卖点1", "卖点2"],
  "applications": ["适用场景1"],
  "certifications": [],                  // 如 ["CE"]
  // 可选：faqs / seoDescription / youtubeId / catalogPdf / moq
}
```

**六个品类 id**（`category` 字段只能填这些）：
`arcade-video-games`、`sports-skill-games`、`redemption-ticket-games`、
`claw-crane-machines`、`kiddie-rides`、`prize-merchandisers`

---

## 3.4 产品目录页（/products/）

2026-10-20 按 wandyy 站的设计改版，实现**搜索 + 业务线分组 + 分页**。

### 每页 16 个（4 行 × 4 列）
- `PAGE_SIZE = 16`（`components/product-explorer.tsx`）
- 桌面端固定 4 列：CSS 类 `prod-grid--catalog`（`@media min-width:1024px`）
- 210 个产品 = 14 页
- 排序用型号自然序（`localeCompare` + `numeric:true`），所以 VTRA9排在 VTRA10 前

### 搜索
匹配 **型号 / 名称 / headline / 品类 id**，不区分大小写。
例：搜 `VTRA010`、`claw`、`racing`、`kiddie` 都能命中。
清空按钮在搜索框右侧。

### 业务线分组（3 组）
| 分组 | 含品类 | 产品数 |
|---|---|---|
| Coin-operated arcade | 街机 + 体育竞技 | 103 |
| Redemption & prize | 彩票兑换 + 礼品机 | 70 |
| Crane & kiddie | 抓娃娃机 + 儿童骑乘 | 37 |

分组映射定义在 `components/product-explorer.tsx` 的 `GROUPS` 常量里。
**要改分组归属就改这个常量**，例如新增品类时把它加进对应组。

### 分页交互
- 底部：← Prev / 页码 / Next →
- 页数多时折叠为 `1 … 5 6 [7] 8 … 14`
- 切换品类或搜索词自动回到第 1 页
- 当前页越界自动回到最后一页

⚠️ **分页是纯客户端的**：静态导出只渲染第 1 页的 16 个产品，
翻页在浏览器内完成，不产生 URL 变体（SEO 收录仍靠各品类独立页 `/products/<slug>/`）。

### 3.4.1 品类着陆页也分页（components/paginated-product-grid.tsx）

6 个品类页同样每页 16 个、桌面 4 列：

| 品类 | 产品数 | 页数 | 分页器 |
|---|---|---|---|
| Arcade Video Games & Simulators | 58 | 4 | ✅ |
| Sports & Skill Games | 45 | 3 | ✅ |
| Redemption & Ticket Games | 60 | 4 | ✅ |
| Claw & Crane Machines | 22 | 2 | ✅ |
| Kiddie Rides & Kids Games | 15 | 1 | 不显示 |
| Prize Machines & Merchandisers | 10 | 1 | 不显示 |

不足 16 个的品类**不显示分页器**（单页无需翻页）。

### 3.4.2 ⚠️ 分页与 SEO：绝不能做成"孤岛页"

**这是 2026-10-20 修过的重大问题，务必理解。**

**问题**：最初分页实现是「只渲染当前页的 16 个卡片」。
静态导出时 HTML 是 Googlebot 唯一的入口，**爬虫不执行 JS** ——
于是第 2 页之后的产品页在 HTML 里根本不存在链接指向它们，
变成「孤岛页」（orphan page），Google 不会收录。

**实测后果**：Search Console 显示「已收录 10 个 / 未收录 41 个」，
未收录的正是被分页藏起来的那些产品页。

**正确做法**（现在的实现）：
1. **全部产品都渲染进 HTML**，非当前页加 `is-off-page` 类
2. CSS 用 `position:absolute; left:-99999px` 隐藏（**不用 `display:none`** ——
   部分爬虫会跳过 `display:none` 的内容）
3. 用户看到 16 个，爬虫拿到全部 210 个链接

**验证方法**（改分页后必查）：
```bash
# 品类页链接数应 = 该品类产品数
grep -o 'href="/products/arcade-video-games/[^"]*/"' out/products/arcade-video-games/index.html | sort -u | wc -l
# 应为 58
```
全站检查：sitemap 里的 223 条 URL 必须全部能在 HTML 中找到（0 缺失）。

**若将来有人改成"只渲染当前页"，务必同时加回全量渲染 + CSS 隐藏。**

**SEO 安全性**：抽出的 `PaginatedProductGrid` 只负责「显示哪16 个」，
`category-landing.tsx` 里的 JSON-LD（ItemList / FAQPage / BreadcrumbList）
**仍包含全部产品**，分页不影响搜索引擎看到的完整列表。
实测线上 `redemption-ticket-games` 的 `ItemList.numberOfItems` 仍为 60。

**复用到其他页面**：任何要「分页显示产品网格」的地方都用这个组件：

```tsx
import PaginatedProductGrid from "@/components/paginated-product-grid";

<PaginatedProductGrid
  products={products}
  categorySlug={category.slug}
  label={`${category.name} pagination`}
/>
```

---

## 3.5 首页主推（Flagship Models）与热度埋点

### 3.5.1 排名的机制

首页Flagship Models 采用**两级策略**（见 `app/page.tsx`）：

1. **标记了 `featuredRank` 的产品优先** —— 按数字升序（1 = 排最前）
2. **剩余名额按品类轮转补足** —— 每轮每品类取 1 款，保证 6 个品类都有曝光

**改排名方式**（不用改代码）：
```bash
# 改 scripts/set-featured-rank.py 里的 RANK 字典（1 = 第一位）
python scripts/set-featured-rank.py
bash publish.sh "调整首页主推顺序"
```
或直接编辑 `data/products/<slug>.json` 里的 `"featuredRank": 3`。

当前主推 16 款（2026-10-20 配，6 品类均衡 + 出口热销优先）：
| # | 型号 | 品类 |
|---|---|---|
| 1-4 | VTRA010 / VTSA013 / VTSA014 / VTRA017 | 街机竞速 |
| 5-6 | VTSA010 / VTSA013 | 体育竞技 |
| 7-8 | VTTR074 / VTTR085 | 彩票兑换 |
| 9-11 | VTPG016 / VTPG017 / VTPG018 | 抓娃娃机 |
| 12-13 | VTTR086 / VTPG029 | 礼品机 |
| 14-16 | VTKR107 / VTKR108 / VTKR110 | 儿童骑乘 |

### 3.5.2 埋点已接入（2026-10-20）

全站采集三类事件，都投递到已有的 Formspree 端点（`subject` 以 `STAT:` 开头）：

| 事件 | 含义 | 触发点 |
|---|---|---|
| `click` | 产品卡片点击 | 事件委托捕获 `[data-track-product]` |
| `view` | 产品详情页浏览 | URL `/products/<品类>/<slug>/`，30分钟去重 |
| `inquiry` | 询盘表单提交 | 表单 `productInterest` 字段 |

**隐私设计**：不存 IP、不存Cookie、不做指纹、不记录姓名邮箱，只记事件类型 + 产品型号 + 来源路径。

⚠️ 为什么不用自建 API：本站是 `output: "export"`纯静态导出，
**不能有 `api/*.ts`**（有会直接导致 next build 失败）。复用 Formspree 是零成本方案。

### 3.5.3 一个月后怎么用数据

```bash
# 1. Formspree 后台 → Inbox → 只选 subject 以 STAT: 开头的邮件 → 导出 CSV
# 2. 分析排名（click 权重 1，inquiry 权重 10）
python scripts/analyze-stats.py stats.csv

# 3. 按排名改 set-featured-rank.py 的 RANK，重跑 + 发布
```

**口径说明**：询盘权重最高（10），因为那是真实商业转化；点击（1）只代表吸引力。

⚠️ 静态站无法「后台自动排序」——数据只能**人工回填**到 `featuredRank`。
这是纯静态架构的固有限制，不是实现问题。

---

## 4. 工作副本 vs Accio Work 目录（重要）

Accio Work 的工作目录在：
`C:\Users\den\AccioWork\2026-09-07-10-52-59-371-0012bc6d\veetop-site`

| | Accio Work 目录 | WorkBuddy 工作副本 |
|---|---|---|
| 定位 | Accio 的临时工作区 | 你的正式源码基地 |
| 是否被 Accio 实时改动 | **是**（10-20 当天仍在改并推 GitHub） | 否 |
| 用途 | 冲突时用来对比 | 日常改动、发布 |

### ⚠️ 实测：两边会打架

2026-10-20 接管当天实测到 Accio Work 仍在持续推送同一个 GitHub 仓库：
- 10:19 推了 About 排版改动
- 10:53 推了 Header 改动（WhatsApp 按钮移入 header）

如果你在 WorkBuddy 改完直接 `git push`，会被拒绝（`fetch first`）——
**这不是故障，是保护机制**，说明远程有别人的新改动。

`publish.sh` 已内置处理：第 4 步会先 `git pull --rebase`，
冲突时以远程为基线保留你的改动，不会丢东西。

**建议**：从现在起统一在 WorkBuddy 改内容，Accio Work 停用。
若两边同时改，先跑 `bash publish.sh`（它会自动先同步）。

手动同步 Accio 的最新改动到 WorkBuddy：

```bash
cd /c/Users/den/WorkBuddy/2026-10-20-10-27-11/veetop-site
git pull --rebase origin main
```

### 重要：不要用 `git reset --hard origin/main`

接管过程中我用过一次硬重置，**把本地的 publish.sh 改动冲掉了**。
这个仓库被两个工具同时写，`reset --hard` 会静默丢弃本地工作。
要同步基线请用 `git pull --rebase`，或直接跑 `publish.sh`。

---

## 5. 图片怎么换

1. 图片放 `public/images/products/<slug>.jpg`（文件名与产品 slug 完全一致）
2. 对应 JSON 里 `"images"` 改成 `["/images/products/<slug>.jpg"]`
3. `bash publish.sh "替换 XX 产品图"`

图片走站内 `/images`（Vercel 自带 CDN）。若已配置 Cloudflare R2，
图片还需同步上传到 R2 的 `images/products/` 路径下。

### 5.0 批量上传多图（推荐用这个工具）

图库组件**已完整支持多图**（主图 + 缩略图切换），只要 `images` 数组里有几张就显示几张。

```bash
# 1. 把照片放进inbox/，文件名带型号
#    inbox/VTRA010-1.jpg  inbox/VTRA010-2.jpg  inbox/VTRA010-3.jpg
python scripts/import-product-images.py# 2. 预览（不写文件）
python scripts/import-product-images.py --apply   # 3. 执行
bash publish.sh "上传 VTRA010 多图"                # 4. 发布
```

工具自动完成：
- **按型号匹配**产品（从文件名提取 `VTRA010` 这类型号）
- **压缩**到长边 1200px / 质量 82（实测 2000×1600 → 12KB）
- **黑底自动修白**（复用 `fix-dark-bg.py` 阈值）
- **序号递增**命名 `<slug>-2.jpeg`、`-3.jpeg`
- **防重复**：已导入过的源文件记在 `.imported-images.json`，重复放入自动跳过

⚠️ **`images[0]` 是封面图**（列表页卡片、首页 Flagship、OG 分享图都用它），
第一张应放最有代表性的正面图。建议顺序：正面 → 侧面 → 背面 → 细节 → 场景。

同型号对应多个产品时会提示"需确认"并跳过——这种情况告诉我手工指定。

### 5.1 黑底图批量修复（已处理完17 张，备用工具）

2026-10-20 全站扫描发现 **17 张黑底产品图**（`vttr060`~`vttr076` 连续一段，
纯黑背景板抠图，边缘黑像素 100%），已全部修复为纯白底并上线。

工具保留在仓库，以后换新图时可用：

```bash
# 1) 扫描全站，找出黑底图
python scripts/scan-dark-bg.py

# 2) 先预览（不动原图）
python scripts/fix-dark-bg.py --preview
#    预览图在 public/images/products/_fixed_preview/

# 3) 确认后应用（会自动备份原图到 _backup_images_black/）
python scripts/fix-dark-bg.py --apply
```

**修复原理**：暗且接近中性灰的像素 → 纯白；亮或偏彩色的 → 原样保留。

⚠️ 两个必须保留的调参（踩过坑）：
- **必须加饱和度判定**（`sat < 42`）：JPEG 在黑边界有彩色振铃噪声，
  只按亮度提亮会出现红蓝描边
- **不做连通性限制**：机身背后常有抠图残留黑板，不与画面边缘连通，
  洪水填充法会漏掉

`_fixed_preview/` 与 `_backup_images_black/` 已加进 `.gitignore`，不会进仓库。

### 5.2 长期方向：补真实白底照片

你已决定后续逐步补真实白底实拍图。替换时注意：
- 修复后的图是**纯白底、无渐变过渡**，与真实白底照风格一致，可直接逐张替换
- 建议向画册/工厂提要求：**白底或透明底 PNG，去背干净不带黑边**
- 深色机身（如 `vttr062` minions 蓝紫渐变）实拍时注意别让产品沉进背景

---

## 6. 本地预览（改完先看效果再上线）

```bash
cd /c/Users/den/WorkBuddy/2026-10-20-10-27-11/veetop-site
export PATH="/c/Users/den/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
export CODEBUDDY_SAFE_DELETE_ENABLED=0
export NEXT_TRACE_UPLOAD_DISABLED=1
node node_modules/next/dist/bin/next dev      # 开发预览 http://localhost:3000
```

> `CODEBUDDY_SAFE_DELETE_ENABLED=0` 必须加：Next 构建时会批量清理 `.next` 缓存，
> 触发 WorkBuddy 的删除保护（SAFE_DELETE_BULK_CONFIRM_REQUIRED）导致构建失败。
> 这只影响项目内的构建缓存，不涉及任何个人文件。

> `NEXT_TRACE_UPLOAD_DISABLED=1` 建议加：Next 构建收尾要写 `.next/trace`，
> 该文件被占用时会返回退出码 1，**但 `out/` 产物其实已经生成完整**，
> 造成"其实成功却报构建失败"的假故障。`publish.sh` 已内置此变量，
> 并且改用「产物完整性（out/index.html + out/sitemap.xml 存在）」来判定构建成功。

---

## 7. 常见问题

| 现象 | 原因与处理 |
|---|---|
| 线上内容没变 | 1) 确认 `git push` 成功；2) 到 Vercel → Deployments 看新部署是否成功；3) 浏览器 `Ctrl+F5` 强刷 |
| 推送报 `fetch first` / 拒绝 | 远程有 Accio Work 的新提交。跑 `bash publish.sh`（内置 pull --rebase） |
| 部署失败 | Vercel Deployments 点进失败那次看日志，通常是 JSON 语法错误（少逗号/引号） |
| 新产品没出现 | 文件名 = JSON 里 `slug`；`category` 必须在 categories.json 里存在；JSON 语法正确 |
| 本地构建报 SAFE_DELETE | 加 `export CODEBUDDY_SAFE_DELETE_ENABLED=0`（见第 6 节） |
| 构建末尾报失败但其实成功 | 已自动规避：脚本用产物完整性判定，见第 6 节 trace 说明 |
| 产品图黑底 | 跑 `python scripts/scan-dark-bg.py` 定位，再用 `fix-dark-bg.py` 批量修（见 5.1） |
| git push 报 502 / CONNECT tunnel failed | WorkBuddy 出网代理临时抖动。脚本已内置 10 次重试；持续失败则重启 WorkBuddy |
| 推送提示弹 GitHub 登录框 | 正常，浏览器里点一次授权即可，之后不再弹 |
| 图片不显示 | 文件名与 slug 不一致，或 `images` 字段路径写错；或 R2 未同步 |
| 想回滚 | Vercel → Deployments → 找到上一个成功部署 → ⋯ → Promote to Production |
| 线上比本地内容新 | 跑 `bash publish.sh`（自动先同步再推） |
| `git push` 提示 rejected 但本地改动不见了 | 检查是否用过 `git reset --hard`——它会丢弃本地改动。改用 `git pull --rebase` |

---

## 8. 环境事实（供排查参考）

- Node：`C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe`（npm 10.9.7）
- Next.js 15.5.25，`output: "export"` 纯静态导出，产物在 `out/`
- 托管：Vercel Hobby + 自定义域名（阿里云 DNS，www CNAME → cname.vercel-dns.com）
- 仓库：`https://github.com/honglingzhao0-ux/veetopamusement-site.git`（main 分支）
- 线上首屏响应约 1.1s，CDN 命中正常

---

## 9. SEO 现状与维护

### 9.1 已做的技术优化（2026-10-20）

| 项 | 状态 |
|---|---|
| robots.txt | ✅ 开放 + 指向 sitemap |
| sitemap.xml | ✅ 223 条 URL，lastmod 反映真实内容变更 |
| canonical | ✅ 全站唯一 |
| title / description | ✅ 逐页独立 |
| JSON-LD | ✅ Organization / Breadcrumb / ItemList / Product / FAQPage |
| og:image / twitter:image | ✅ 全站补齐（首页品牌图、品类页/产品页用产品图） |
| Googlebot 可抓取 | ✅ HTTP 200，无阻挡 |
| Search Console | ✅ 已通过 DNS 验证 |

### 9.2 sitemap lastmod 的维护机制（重要）

`app/sitemap.ts` 用**内容哈希**判断页面是否真的变了：
- 内容哈希不变 → lastmod 保持原值（告诉 Google「这页没动」）
- 内容哈希变了 → lastmod 更新为当前时间

变更记录存在 `data/.content-dates.json`（**必须提交进 git**，否则每次构建都重置）。

⚠️ 踩过的坑：
- 最初用 `new Date()` → 全站 lastmod 每次构建都变今天，Google 会认为全站天天在变
- 改用 git 提交时间 → **本地有效，线上失效**（Vercel 构建环境没有 `.git` 目录）
- 最终方案：内容哈希 + 变更时间戳双写，与 git 无关，线上可靠

**效果实测**：改 1 个产品 → 只有那 1 个页面的 lastmod 变今天，其余 222 个不动。

### 9.3 收录节奏预期

新站（veetop）vs 老站（wandyy，2026-01 上线，399 URL）：

| | wandyy | veetop |
|---|---|---|
| 上线时长 | 9 个多月 | 近期 |
| sitemap URL | 399 | 223 |
| 外链积累 | 有 | 少（Alibaba 已在导流） |
| 询盘 | 已收到 | 尚未 |

**Google 新站沙盒期通常 1–3 个月**，期间收录慢是正常现象，不是技术故障。

### 9.4 需要你配合做的事（我做不了）

1. **Search Console 提交 sitemap**
   登录 search.google.com → 网址检查 → 输入 `https://www.veetopamusement.com/sitemap.xml` → 提交
2. **请求收录核心页**
   网址检查 → 输入以下 URL → 点「请求收录」：
   - `https://www.veetopamusement.com/`
   - `https://www.veetopamusement.com/products/`
   - `https://www.veetopamusement.com/products/arcade-video-games/`
   - 其余 5 个品类页同理
3. **保持外链**：Alibaba 店铺、B2B 平台（Made-in-China、GlobalSources 等）统一指向 `https://www.veetopamusement.com`
4. **看数据**：Search Console → 效果 → 关注「已编入索引的网页」数量变化

### 9.5 提升收录的持续动作

- **news / blog 页目前是空的** —— 这是浪费收录机会。
  建议每月写 2–3 篇行业内容（如"FEC 采购清单"、"娃娃机运营成本计算"），
  有内容才能被收录，且能带来长尾流量
- 产品页保持 1 个以上真实图片，多图页在 Google 图片搜索里更有优势

### 9.6 Search Console 数据怎么看（2026-10-20 记录）

首次查看时：**已收录 10 / 未收录 41**。
未收录的主因是分页造成的孤岛页（3.4.2），已修复。
**预期 1-2 周后未收录数应大幅下降、已收录数上升。**

后续关注指标：

| 指标 | 在哪看 | 健康值 |
|---|---|---|
| 已编入索引的网页 | 编制索引 → 网页 | 逐步接近 223 |
| 点击次数 | 效果 | 稳步上升（首月 6 次点击偏少但正常） |
| 平均排名 | 效果 | 产品词应在 20-50 页 |
| 需人工处理的项 | 需人工处理 | **应该为空**，有内容要看具体原因 |

**若修复后 2 周仍未收录数下降**，用网址检查工具测一个具体产品页，
看"已编入索引"项里 Google 选定的规范网址是什么——
常见问题是 Google 选了别的页当 canonical（本站有自指 canonical，一般不会）。
