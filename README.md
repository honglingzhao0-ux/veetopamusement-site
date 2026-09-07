# VEETOP Amusement 独立站（示例框架）

面向海外 B2B 买家的**游戏游艺设备制造商**英文独立站代码框架。当前所有产品、联系方式、公司数据均为**示例占位内容**，用于展示结构与流程，正式上线前请按本文「占位内容替换清单」逐项替换。

- 技术栈：Next.js（App Router）+ TypeScript，`output: "export"` 纯静态导出
- 托管方案：GitHub（源码）→ Vercel（部署）→ Cloudflare R2（图片 CDN），域名解析至现有阿里云域名 `veetopamusement.com`
- 零付费依赖；`npm run build` 产物为可直接托管的静态文件，可在 Vercel 免费额度内运行

---

## 1. 目录结构

```
veetop-site/
├─ app/                        # Next.js App Router 页面
│  ├─ layout.tsx               # 全局布局：meta/OG + Organization JSON-LD + 悬浮 WhatsApp
│  ├─ page.tsx                 # Home
│  ├─ about/page.tsx           # About：工厂实力 / OEM·ODM / 认证
│  ├─ faq/page.tsx             # 独立 FAQ 页（站级贸易条款 + FAQPage schema）
│  ├─ thank-you/page.tsx       # 询盘提交成功确认页（noindex）
│  ├─ contact/page.tsx         # Contact：询盘表单 + 联系方式
│  ├─ products/page.tsx        # 全目录总览（分类跳转 + 本地筛选）
│  ├─ products/[slug]/page.tsx # 统一动态路由：产品 slug→详情页；品类 slug→品类着陆页
│  ├─ llms.txt/route.ts        # /llms.txt 纯文本路由（给 AI 引擎的事实清单）
│  ├─ sitemap.ts               # 构建时自动生成 sitemap.xml（含品类页与 FAQ 页）
│  ├─ robots.ts                # 构建时自动生成 robots.txt（AI 爬虫保持开放）
│  ├─ icon.svg                 # favicon
│  └─ globals.css              # 全局样式（工业风设计系统）
├─ components/                 # header/footer/product-card/类别着陆页/FAQ 手风琴/两套询盘表单等
├─ data/
│  ├─ categories.json          # 品类元数据（slug/标题/导语/FAQ×5 → 每个品类独立着陆页）
│  └─ products/*.json          # ★ 每个产品一个 JSON（新增即自动出页面）
├─ public/
│  └─ images/products/*.svg    # ★ 产品占位图（与产品 JSON 同 slug 命名）
├─ scripts/generate-placeholders.mjs  # 依据产品 JSON 批量生成占位 SVG
├─ lib/
│  ├─ cdn.ts                   # 图片 URL 统一出口（CDN 前缀 / 本地回退）
│  ├─ inquiry.ts               # 询盘提交逻辑（endpoint POST / mailto 兜底）共用
│  └─ products.ts              # 产品目录加载器（构建期读取 data/）
├─ site.config.ts              # ★ 品牌/联系方式/公司数据/FAQ 占位——集中替换点
├─ next.config.ts              # output: export + trailingSlash
├─ .env.example                # NEXT_PUBLIC_CDN_URL 等环境变量示例
├─ DEPLOYMENT.md               # 部署与运维手册（面向非程序员）
└─ README.md
```

### 页面与路由速览

| URL | 类型 | 说明 |
|---|---|---|
| `/` | 静态 | Home |
| `/products/` | 静态 | 全目录总览 + 分类锚点（浏览便利，不承载品类词） |
| `/products/<品类slug>/` | 静态 | **品类独立关键词着陆页**（6 个，SEO 收录主体；H1/正文/FAQ/CTA 一体） |
| `/products/<产品slug>/` | 静态 | 产品详情页（含 FAQ 块、底部快捷询盘、可选视频/PDF） |
| `/about/`、`/contact/`、`/faq/`、`/thank-you/` | 静态 | 公司 / 询盘 / 站级 FAQ / 提交确认 |
| `/llms.txt`、`/sitemap.xml`、`/robots.txt` | 构建产物 | AI 事实清单 / 站点地图 / 爬虫规则 |

### FAQ 三层分工（内容互不重复、口径统一）

1. **站级贸易条款**（MOQ/付款/交期/保修/认证…）→ `site.config.ts` 的 `faqs`，展示于 `/faq/`，供 llms.txt 引用；
2. **品类级 FAQ** → `data/categories.json` 每品类的 `faqs`（5 条），展示于对应品类着陆页；
3. **产品级 FAQ** → `data/products/*.json` 可选 `faqs` 字段，展示于产品详情页；产品未填时自动回退 `site.config.ts` 的 `defaultProductFaqs`（5 问模板）。

## 2. 本地运行

```bash
cd veetop-site
npm install        # 安装依赖
npm run dev        # 开发模式 http://localhost:3000
npm run build      # 生产构建，纯静态产物输出到 out/
npm run typecheck  # TS 类型检查
```

预览静态产物（模拟 Vercel 托管）：

```bash
npx serve out -l 4173   # 然后访问 http://localhost:4173
```

## 3. 产品是"数据驱动"的

产品全部来自 `data/products/` 下的单个 JSON 文件，页面代码不做任何产品相关的硬编码：

### 新增一个产品（无需改代码）

1. 在 `data/products/` 复制任意现有 JSON，改名（文件名 = slug，如 `my-new-game.json`）；
2. 修改 `slug`（必须与文件名一致）、`name`、`model`、`category`（用 `data/categories.json` 中已有的 id）、`specs`、`features`、`applications`、`moq`、`certifications` 等字段；可选字段（不填不影响构建）：`faqs`（产品级 FAQ 问答，缺省用站点模板）、`seoDescription`（人工优化描述，缺省截取 description）、`youtubeId`（有值才渲染演示视频）、`catalogPdf`（有值才显示 Download Catalog 按钮，文件放 `public/catalog/` 或经 CDN）；
3. 放一张图片：
   - 方式 A（占位图）：重新运行 `node scripts/generate-placeholders.mjs`，自动生成同名 SVG；
   - 方式 B（真实图）：把照片放到 `public/images/products/<slug>.jpg`，并把 JSON 中 `images` 改为 `["/images/products/<slug>.jpg"]`；
4. 重新 `npm run build` 或刷新 dev 页面即可——列表、分类筛选、详情页、sitemap 都会自动包含该产品。

### 删除 / 下架一个产品

直接删除对应的 JSON（和图片）即可；构建会自动不再生成该产品页面。

### 调整分类

编辑 `data/categories.json`（id/名称/简介/顺序/FAQ）。新增分类 id 后即可在产品的 `category` 字段引用；首页分类卡、页脚、品类着陆页自动更新。新分类可选的 SEO 字段：`slug`（缺省=id）、`seoTitle`、`metaDescription`、`longIntro`、`faqs`（5 条，展示于该品类独立页）。

## 4. 图片与 Cloudflare R2（CDN）

- 代码中所有图片地址**统一经** `lib/cdn.ts` 的 `cdnUrl()` 处理，禁止在页面/组件里手写图片路径。
- 规则：
  - 未设置 `NEXT_PUBLIC_CDN_URL`：图片使用站内 `/images/...`（本地与 Vercel 均直接显示）；
  - 设置了 `NEXT_PUBLIC_CDN_URL=https://cdn.veetopamusement.com`：图片自动拼接为 `https://cdn.veetopamusement.com/images/...`。
- 上线流程建议：
  1. 把 `public/images/` 整个目录上传到 R2 bucket（保持 `images/...` 前缀），并通过 R2 公开访问/自定义域名暴露；
  2. 在 Vercel 项目设置中加环境变量 `NEXT_PUBLIC_CDN_URL`；
  3. 重新部署。本地开发时不要设置该变量即可继续用本地图。

## 5. 部署到 GitHub + Vercel

1. **GitHub**：在 `veetop-site/` 内执行：

   ```bash
   git init
   git add .
   git commit -m "init veetop static site"
   git remote add origin https://github.com/<your-org>/veetop-site.git
   git push -u origin main
   ```

2. **Vercel**：导入该仓库，框架自动识别 Next.js；无需额外构建命令。
   - 若提示，确认 Build Command 为 `npm run build`，Output Directory 为 `out`（`output:"export"` 下 Vercel 通常自动处理）。
3. 环境变量（Vercel → Settings → Environment Variables）：
   - `NEXT_PUBLIC_SITE_URL=https://www.veetopamusement.com`
   - `NEXT_PUBLIC_CDN_URL=https://cdn.veetopamusement.com`（图片接入 R2 后）
4. 域名：在 Vercel 项目 Domains 中绑定 `www.veetopamusement.com` 与 `veetopamusement.com`（按 Vercel 提示去阿里云 DNS 添加 CNAME / A 记录，并把主域名 301 到 www 或反向，二选一作为 canonical）。

> 本地推送 GitHub 前，先把 `site.config.ts` 的占位内容替换好（第 6 节），避免公开仓库出现无意义占位联系方式。

## 6. 占位内容与替换清单（REPLACE 标记）

| 位置 | 内容 | 说明 |
|---|---|---|
| `site.config.ts` | 邮箱 / WhatsApp / 电话 / 地址 / 工作时间 | 全局搜索 `REPLACE:` 逐项替换；全站（页脚、联系页、按钮）自动生效 |
| `site.config.ts` | `formEndpoint` | 询盘表单真实端点（Formspree / Web3Forms）；留空时表单会用 mailto 兜底（仅演示） |
| `site.config.ts` | `companyFacts` 年份/面积/出口国数/认证列表 | 替换为真实企业数据；首页与 About 多处展示 |
| `site.config.ts` | `isDemoSite` | 替换完成后改为 `false`，移除顶部"Demo site"提示条 |
| `data/categories.json` + `data/products/*.json` | 产品目录 | 全部为示例占位（卡片带 SAMPLE 标记）；替换/新增为真实产品线 |
| `public/images/products/*.svg` | 产品占位图 | 换成真实照片（jpg/png，同 slug 命名并同步 JSON `images`） |
| `.env.example` / Vercel | 域名与 CDN 地址 | 见第 4、5 节 |
| About 页公司简介段落、认证卡片描述 | 文字占位 | 用真实资料改写 |
| `app/layout.tsx` Organization JSON-LD | 机构结构化数据 | 依赖 `site.config.ts`，自动联动 |
| SEO 默认 title/description/keywords | `site.seo` | 可自行优化关键词 |

## 7. 常见问题（FAQ）

**Q1：为什么详情页/列表页没出现我新加的产品？**
检查：JSON 文件名与内部 `slug` 一致；`category` 存在于 `categories.json`；JSON 语法正确（可先 `node -e "JSON.parse(require('fs').readFileSync('data/products/xx.json','utf8'))"`）。改完重新构建或刷新 dev。

**Q2：图片不显示？**
若设置了 `NEXT_PUBLIC_CDN_URL` 但 R2 尚未上传/未公开，就会 404。本地开发把该变量从 `.env.local` 删掉即可回退本地图片。

**Q3：`npm run build` 的产物在哪？怎么本地看？**
产物在 `out/`（纯静态）。用 `npx serve out -l 4173` 预览。注意 `output: "export"` 下不能用 `next start`。

**Q4：想改风格（颜色/字体）？**
集中在 `app/globals.css` 顶部 `:root` 的 CSS 变量（主色 `--accent`、深蓝 `--navy-*` 等）。

**Q5：询盘表单收不到邮件？**
表单默认走 mailto 兜底（仅演示）。正式上线请在 `site.config.ts` 的 `contact.formEndpoint` 填入 Formspree（`https://formspree.io/f/xxxx`）或 Web3Forms（`https://api.web3forms.com/submit` + 隐藏 `access_key`）端点；Web3Forms 需在表单里增加 `<input type="hidden" name="access_key" value="...">`。

**Q6：页面里的"Sample"标记怎么去掉？**
两类：顶部 Demo 提示条 → `isDemoSite: false`；产品卡/详情 SAMPLE 徽标 → 由产品 JSON 的 `sample: true` 控制，真实产品置为 `false`（或删除字段，默认按真实处理，见 `lib/products.ts`）。

**Q7：移动端效果如何？**
全局响应式（断点 980px / 620px），含汉堡菜单；用手机访问 dev 或构建预览即可检查。

**Q8：SEO 都做了哪些？**
全站统一 meta/OG（`app/layout.tsx`）、每页独立 title/description/canonical、构建期生成 `sitemap.xml` 与 `robots.txt`、Organization + Product + BreadcrumbList JSON-LD、语义化标签与图片 alt。上线后建议到 Google Search Console 提交 sitemap。

## 8. 给开发者的说明

- 组件以 Server Component 为主；只有交互部分（导航菜单、分类筛选、询盘表单）是 Client Component，位于 `components/`。
- `lib/products.ts` 只在构建期用 Node `fs` 读取 `data/`，不会打包进客户端。
- 新增页面只需在 `app/` 下建路由文件夹；需要被 sitemap 收录的静态页记得在 `app/sitemap.ts` 的 `staticPages` 里追加。
- 本框架未接入任何付费服务；字体使用系统栈，无外部请求，构建离线可完成（`npm install` 除外）。

---

> 示例内容声明：本仓库所有产品型号、图片、公司介绍、认证、联系信息均为占位示例，仅用于演示网站结构与流程，不构成真实产品承诺。
