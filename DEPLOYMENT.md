# VEETOP 独立站：部署与运维手册（从零到上线）

> 写给**不写代码**的负责人：每一步按顺序照做即可，先 GUI 点按、再给可复制的命令。
> 本文对应的代码在 `veetop-site/` 文件夹（仓库建议名 `veetopamusement-site`），所有命令都在这**一个文件夹里**执行。

## 0. 整体流程（先看这张图）

```
① GitHub（代码仓库，免费）
      │ git push
      ▼
② Vercel（网页托管，免费）─────── ③ 阿里云域名 veetopamusement.com
      │                          （解析指到 Vercel，邮箱记录保留）
      ▼
   网站 https://www.veetopamusement.com
      ▲
图片走 ④ Cloudflare R2（免费额度存图，域名 cdn.veetopamusement.com）
```

- 网站本身是"纯静态网页"（没有服务器程序），Vercel 免费额度完全够用。
- 产品资料、图片全部是**普通文件**：改文件 → `git push` → 网站自动更新，不需要任何人碰服务器。

### 路径约定（重要）

- 你的电脑上存放网站的文件夹叫 **`veetop-site`**（里面能看到 `data/`、`app/`、`site.config.ts` 等）。
- 下面所有命令默认你已经"进入"这个文件夹。Windows 打开方式：在文件夹空白处 **按住 Shift + 右键 →「在终端中打开」/「在此处打开 PowerShell」**；或者在文件夹地址栏输入 `cmd` 回车。
- 仓库推送的是 `veetop-site` **里面的内容**（相当于把整个文件夹变成 Git 仓库），不要把它的上级目录一起推上去。

---

## 第 0 步：注册账号（一次性，全部有免费额度）

| 平台 | 网址 | 用途 | 免费额度（以官网当前为准） |
|---|---|---|---|
| GitHub | github.com | 存放网站源码 | 免费，无限私有仓库 |
| Vercel | vercel.com | 托管网页、自动发布 | 免费（Hobby）计划；可绑自定义域名、自动 HTTPS |
| Cloudflare | cloudflare.com | 存放产品图片（R2 对象存储） | 免费额度：存储约 10GB + 每月一定量读写操作；图片流量无出口费 |
| 阿里云 | 已有账号 | 域名 veetopamusement.com 的 DNS 解析 | 仅域名续费 |

注册建议用公司邮箱，能收验证邮件即可。GitHub/Vercel 建议同一个邮箱、互相授权登录，后续"一键导入"最省事。

**本机需要装的东西**（第 1 步推送代码用，只在第一次准备）：
1. **Git**：到 git-scm.com 下载安装，一路默认下一步。装完桌面右键会出现 "Open Git Bash here"（可选，不出现也没关系）。
2. 或者完全不装 Git：直接装 **GitHub Desktop**（desktop.github.com），第 1 步有图形化替代方案。

---

## 第 1 步：GitHub 建仓库并把代码推上去

### 1.1 网页上新建仓库（一次）
1. 登录 github.com → 右上角 **+ → New repository**。
2. Repository name 填 **`veetopamusement-site`**。
3. 可见性选 **Private**（私有，更稳妥；Vercel 一样能部署）或 Public 都可以。
4. **不要**勾选 "Add a README / .gitignore / license"（保持空仓库），然后 **Create repository**。
5. 建好后页面会显示一组命令，先放着，到 1.2 用。

### 1.2 首次配置 Git 身份（只做一次）
> 若用 GitHub Desktop 方案可跳过本节，直接看 1.4。

在终端里执行（把名字邮箱换成你自己的；此邮箱用于记录"谁提交的"，不影响收信）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

### 1.3 命令行推送（推荐）

进入 `veetop-site` 文件夹后，逐条执行（一次一条，等上一条成功再执行下一条）：

```bash
git init
git add .
git commit -m "init veetop static site"
git branch -M main
git remote add origin https://github.com/你的GitHub用户名/veetopamusement-site.git
git push -u origin main
```

- 最后一条会弹窗让你登录 GitHub（Git for Windows 的凭据窗口），按网页提示登录一次即可，以后不再问。
- 若提示输入**密码**而不是弹窗：GitHub 2013 年起不再收密码，需用"令牌"。网页路径：GitHub → 右上头像 → **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token**，勾选 `repo`，复制生成的 `ghp_...` 粘贴为密码即可（令牌只显示一次，妥善保存）。
- 成功后到 github.com 仓库页面刷新，应能看到 `veetop-site/` 里的全部文件（`app/`、`data/`、`site.config.ts` 等）。

### 1.4 图形化替代方案（不想用命令行）
1. 安装并打开 **GitHub Desktop** → 用 GitHub 账号登录。
2. **File → Add local repository** → 选择本地 `veetop-site` 文件夹。
3. 提示 "Repository not created yet" → 点 **Publish repository** → 名称填 `veetopamusement-site`，勾选私有 → Publish。
4. 以后每次更新：在 GitHub Desktop 左下角填一句说明 → **Commit to main** → **Push origin**。效果与命令行完全一样。

---

## 第 2 步：Vercel 导入仓库，自动部署

1. 打开 vercel.com → 用 GitHub 账号登录（Sign up with GitHub）。
2. 点 **Add New… → Project**（或首页 Import）。
3. **Import Git Repository** → 授权 Vercel 访问 GitHub → 在列表里选 **veetopamusement-site**。
4. 配置页**全部保持默认**即可，直接点 **Deploy**：
   - Framework Preset：会自动识别为 **Next.js**（本项目代码已声明，通常自动选中）。
   - Build Command：`npm run build`（默认值，无需改）。
   - Output Directory：本项目由代码 `output: "export"` 控制，静态产物输出到 `out/`，Vercel 自动识别；如该栏为空或显示 `out` 都不用动。
5. 等待 1–3 分钟，看到绿色 **Congratulations / Production Deployment** 即可。此时会得到一个预览网址 `https://veetopamusement-site-xxxx.vercel.app`，先打开确认首页、产品页、About、Contact 都正常。

> 从这一步起，"改代码 → push 到 GitHub"就会自动触发重新部署，**后续不需要再进 Vercel 点部署**（除了第 5 步改环境变量那次）。

---

## 第 3 步：绑定阿里云域名 veetopamusement.com

> ⚠️⚠️ **先看这条警告（邮箱保护）**：你的域名现在可能正在收发公司邮箱。阿里云解析列表里已有的 **MX（邮件交换）、TXT（含 SPF/DKIM 等邮件验证）、CNAME** 记录，**一条都不要删、不要改**。网页部分我们只做"**添加记录**"（或按 3.3 备注修改一条旧的网站 A 记录）。不确定时宁可多等也不要删除。

### 3.1 在 Vercel 后台添加两个域名
1. Vercel → 进入 **veetopamusement-site** 项目 → 顶部 **Settings → Domains**。
2. 在输入框填 **`veetopamusement.com`** → Add；再填 **`www.veetopamusement.com`** → Add。
3. 添加后 Vercel 会列出它**要求你配置的 DNS 记录及目标值**——⚠️ 下面的表格只是常见值，**最终以 Vercel 这个页面显示的值为准**（Vercel 给的 IP 可能不止一条/数值不同，照抄即可）。

| 主机记录 | 类型 | 记录值（示例，以 Vercel 后台显示为准） |
|---|---|---|
| `@`（裸域） | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns.com` |

### 3.2 去阿里云加记录
1. 登录阿里云控制台 → 搜索进入 **「云解析 DNS」**（域名列表也可以）→ 点击 **veetopamusement.com** → **解析设置**。
2. 点 **添加记录**，按下表填（**类型/主机记录/记录值** 三项以 3.1 的 Vercel 提示为准）：
   - 记录一：类型 `A`，主机记录 `@`，记录值填 Vercel 显示的 IP（示例 `76.76.21.21`），TTL 默认 600 即可。
   - 记录二：类型 `CNAME`，主机记录 `www`，记录值填 `cname.vercel-dns.com`（或 Vercel 显示的值）。
3. 添加完成后**不要删除**同页已有的 MX/TXT 等记录。
   - 备注：若列表里已有一条旧的 `@` 的 `A` 记录指向旧网站（例如旧主机 IP），并且旧网站不再使用，可以**修改**它的记录值为 Vercel 的 IP；若不确定旧网站是否还在用，先只添加 `www` 的 CNAME，旧站确认下线后再动 `@`。

### 3.3 证书与生效等待
- 网页证书（HTTPS 小锁）由 **Vercel 自动免费签发**，你**不需要买证书、不需要上传证书**。
- Vercel 的 Domains 页面会显示状态：添加后先是 **Pending**，DNS 生效后自动变 **Valid**。常见等待：几分钟到 24 小时（阿里云 DNS 改动一般几分钟内生效，Vercel 检查证书是周期性的）。
- 检查 DNS 是否已生效（Windows）：按 `Win + R` 输入 `cmd` 回车，执行：
  ```bash
  nslookup www.veetopamusement.com
  ```
  能看到类似 `cname.vercel-dns.com` / Vercel IP 即为生效。若还是旧地址，说明还在等 DNS 缓存，过一会儿再查。
- 状态变 Valid 后访问 **https://www.veetopamusement.com** 应看到网站。

### 3.4（可选）让裸域自动跳到 www（二选一，推荐 www 为主）
Vercel → Settings → Domains → 在 `veetopamusement.com` 那一行点 **Edit → Redirect to** → 选 `www.veetopamusement.com` → Save。这样输入不带 www 的地址也会自动跳到带 www 的页面。（只影响网页访问，不影响邮箱。）

---

## 第 4 步：Cloudflare R2 存产品图片

代码里的图片地址规则（`lib/cdn.ts`）：**设置环境变量 `NEXT_PUBLIC_CDN_URL` 后，图片自动变为 `https://cdn.veetopamusement.com/images/...`；不设置就自动用网站自身的 `/images/...`**。第 5 步才"打开"CDN 开关，所以第 4 步做完即使没生效也不影响网站显示本地图。

### 4.1 创建存储桶（bucket）
1. 登录 dash.cloudflare.com → 左侧 **R2 Object Storage**（没有就点 `Storage`）→ **Create bucket**。
2. 名称填 **`veetop-assets`**；地区选 **APAC**（离中国/亚洲买家近）或默认均可。
3. 创建后进入 bucket。

### 4.2 开通公网访问（两种方式）
- **方式 A：先用临时域名（最快，建议先做这个验证）**
  bucket → **Settings → Public access** → 点 **Allow Access**（允许公网）→ 会得到一个 `xxxx.r2.dev` 域名。先上传一张图（见 4.3）后用 `https://xxxx.r2.dev/images/products/xxx.svg` 直接访问测试。
- **方式 B：正式自定义域名（推荐长期用）**
  1. bucket → **Settings → Custom Domains → Connect domain** → 输入 **`cdn.veetopamusement.com`** → Continue。
  2. Cloudflare 会显示一条要添加的 CNAME：主机记录 `cdn`、记录值形如 `veetop-assets.<你的账号id>.r2.cloudflarestorage.com`（**以页面显示为准**）。
  3. 去阿里云解析（同 3.2 的位置）**添加记录**：类型 `CNAME`，主机记录 `cdn`，记录值填 Cloudflare 显示的那一串。
  4. 回到 Cloudflare 等待状态变 **Active**。之后图片网址就是 `https://cdn.veetopamusement.com/images/products/xxx.svg`。

### 4.3 上传图片（重要：目录结构必须保持 `images/...`）
- 本地图片位于 **`veetop-site/public/images/`**（里面是 `images/products/…`）。上传到 bucket **根目录**时也必须保持这个相对结构，即最终对象路径是 `images/products/图片名.svg`，这样第 5 步的 CDN 地址才能拼对。
- 三种方式任选：

**方式 ① 网页控制台上传（偶尔传几张用这个）**
Cloudflare → R2 → `veetop-assets` → 右侧 **Upload objects** → 用"上传文件夹"选中本地 `images` 文件夹（或手动按 `images/products/` 层级建文件夹后上传文件）。传完检查路径确实是 `images/products/...`。

**方式 ② rclone 批量/日常上传（推荐，装一次以后复制命令即可）**
1. 到 rclone.org 下载安装；在 R2 里创建 API 令牌：Cloudflare 右上头像 → **My Profile → API Tokens → Create Token** → 选 **"R2 对象的读写权限"模板** → 指定只允许访问 `veetop-assets` → 创建后记下 **Access Key ID** 与 **Secret Access Key**（只显示一次）；另需 Cloudflare 首页右下角的 **Account ID**。
2. 首次配置（一路回车到关键项，按提示填）：
   ```bash
   rclone config
   # 选 n (new remote) → 名称填 r2
   # Storage type 输入 s3 回车
   # provider 选 Cloudflare R2（列表里找编号或直接输入 cloudflare）
   # Access Key ID / Secret Access Key 粘贴上面两个值
   # Endpoint 填 https://<你的AccountID>.r2.cloudflarestorage.com
   # 其余问题回车取默认
   ```
3. 上传（把 `public/images` 的**内容**复制到 bucket 根，从而保持 `images/products/...`）：
   ```bash
   rclone copy "本机路径\veetop-site\public\images" r2:veetop-assets --progress
   ```
   例如：`rclone copy "C:\Users\den\AccioWork\2026-09-07-10-52-59-371-0012bc6d\veetop-site\public\images" r2:veetop-assets --progress`
4. 以后只新增/替换几张图，同样执行这条 `rclone copy` 即可（同名文件自动覆盖，不删远端多余文件；想清理时在网页控制台删）。

**方式 ③ wrangler 命令行（可选）**
```bash
npm install -g wrangler
wrangler login
wrangler r2 object put veetop-assets/images/products/图片名.svg --file "public/images/products/图片名.svg"
```

### 4.4 上传后自检
浏览器直接打开（方式 B 生效后）：`https://cdn.veetopamusement.com/images/products/classic-dual-arcade-cabinet.svg`，能看到图即成功。

---

## 第 5 步：Vercel 配置 CDN 环境变量并重新部署

1. Vercel → 项目 **Settings → Environment Variables**。
2. 新增两条（键名不能写错，注意大小写）：
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_CDN_URL` | `https://cdn.veetopamusement.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.veetopamusement.com` |
   - 第二条用于 sitemap/OG 里的绝对网址，可加可不加（不加时用 `site.config.ts` 里的域名，见第 7 步）。
3. 勾选环境 **Production**（建议 Preview、Development 也一起勾选，勾了也不影响本地，本地不读 Vercel 的变量）。
4. **关键：环境变量在"构建时"写进网页**，所以改完必须触发一次部署：项目页 **Deployments** → 最新一次部署右侧 **⋯ → Redeploy**。等 1–3 分钟完成。
5. 刷新线上网站，打开任意产品详情页，右键图片 →"在新标签页打开图片"，地址应显示为 `https://cdn.veetopamusement.com/images/products/...`。

> 本地开发（自己电脑上 `npm run dev`）默认**不设置**该变量 → 自动用本地 `/images`，不用改任何代码。

---

## 第 6 步：日常更新（改产品、换图片 → 自动发布）

### 6.1 你只需要知道的四个"文件位置"

| 想改什么 | 编辑哪个文件 | 说明 |
|---|---|---|
| 产品名称/型号/参数/卖点/认证 | `veetop-site/data/products/` 里的 JSON（一个产品一个文件） | 见 6.3 |
| 产品分类 | `veetop-site/data/categories.json` | 一般不用动 |
| 产品图片 | `veetop-site/public/images/products/` | 文件名要和产品文件同名 |
| 公司名/邮箱/电话/地址/开关 | `veetop-site/site.config.ts` | 见第 7 步 |
| 页面文字（首页/关于等） | `veetop-site/app/` 下的页面文件 | 需懂一点代码，或让程序员改 |

### 6.2 发布命令（每次更新后的固定动作）

在 `veetop-site` 文件夹的终端里执行：

```bash
git add .
git commit -m "更新产品 / 替换图片的说明"
git push
```

等 1–3 分钟，Vercel 自动完成构建发布。浏览器**强制刷新**（`Ctrl + F5`）看新内容。
> 用 GitHub Desktop 的用户：左下角填说明 → Commit → Push，效果一样。

### 6.3 新增一个产品（无需改任何代码）

1. 在 `data/products/` 里**复制任意一个现有 JSON**，重命名成新产品的英文简称，例如 `my-new-game.json`。
2. 用记事本/VSCode 打开，改动这几项：
   - `"slug"`：必须和文件名一致（`my-new-game`）；
   - `"name"` / `"model"`：产品名 / 型号（如 `VT-XXX-100`）；
   - `"category"`：填 `data/categories.json` 里已有分类的 id（如 `arcade-video-games`、`claw-crane-machines` 等）；
   - `"images"`：改成图片地址数组，见下；
    - `"specs"` / `"features"` / `"applications"` / `"certifications"`：参数、卖点、适用场景、认证（格式照抄原文件；公司认证为 CE，写 `["CE"]`）。不要填写未经核实的数字（MOQ/交期/保修等由报价确认）。
3. 图片（二选一）：
   - 有真实照片：把照片放进 `public/images/products/`，命名为 `my-new-game.jpg`，并把 JSON 里 `"images"` 改为 `["/images/products/my-new-game.jpg"]`；
   - 还没有照片：在终端执行 `node scripts/generate-placeholders.mjs` 自动生成同名示意图。
4. 执行 6.2 的发布命令。列表页、分类筛选、详情页、网站地图都会自动带上新产品。

### 6.4 删除 / 下架产品
删除对应的 JSON（及图片文件）→ 执行 6.2 发布命令即可。

---

## 第 7 步：上线前内容核对（本仓库交付时已填入真实内容）

网站的公司信息、联系方式与产品目录**已在交付时填入真实内容**（来源：公司提供 + 官方《2026 Product Catalogue》），集中配置在 `site.config.ts` 与 `data/`，页面没有散落文案。上线前只需核对以下项：

**已就绪（无需改动）**
- 公司法定名 Guangzhou Veetop Amusement Technology Co., Ltd.、域名 veetopamusement.com；
- 邮箱 `Sales@veetopamusement.com`、电话/WhatsApp `+86 188 2417 5545`、地址（广州番禺区新水坑）；
- 公司事实：21+ 年 / 150+ 出口国 / CE 认证 / OEM·ODM（`companyFacts`，首页、About、JSON-LD、llms.txt 同源引用）；
- 产品目录 33 个真实产品（型号/净尺寸/功率抄录自画册），FAQ 全部为"以报价确认为准"的咨询式口径，站内无演示提示条、无 SAMPLE 徽标。

**待补充（不影响上线，按需完成）**
| 位置 | 待补充 |
|---|---|
| `public/images/products/*.svg` | 换成真实产品照片（jpg/png 同 slug 命名，并同步 JSON `images`）；换图后执行 4.3 的 `rclone copy` 同步到 R2（或暂不设 CDN 变量走网站自身 `/images`，见第 10 步 FAQ） |
| `site.config.ts` `contact.formEndpoint` | 询盘表单端点（见第 8 步）；留空时表单用 mailto 兜底 |
| `site.config.ts` `socials`、`address.geo` | 社媒主页、地图坐标（填了才输出结构化数据） |

---

## 第 8 步：询盘表单接入免费方案

代码现状（`components/inquiry-form.tsx`）：表单字段已就绪（Name / Company / Email / Country / Product interest / Message），行为由 `site.config.ts` 的 **`contact.formEndpoint`** 控制：
- 为空字符串（当前默认）：点"Send Inquiry"会用电脑邮件客户端发一封邮件（**尚未接入第三方表单服务时的兜底方案，建议上线后配置端点以便统一收件**）；
- 填入端点地址：表单直接 POST 到该地址，字段名与 Formspree / Web3Forms 兼容。

### 方案 A：Formspree（推荐先试这个）
1. 打开 formspree.io → 用邮箱注册登录 → **New Form** → 填个名字（如 VEETOP inquiry）。
2. 创建后页面给出表单端点 **`https://formspree.io/f/xxxxxxx`**（注册邮箱即收件邮箱）。
3. 打开 `site.config.ts`，找到：
   ```ts
   formEndpoint: "",
   ```
   改为：
   ```ts
   formEndpoint: "https://formspree.io/f/xxxxxxx",
   ```
   （上方的中文注释也说明了这一点。）
4. 执行 6.2 发布命令；到线上联系页提交一次测试，去 Formspree 后台（Inbox）应能看到。
5. 免费版每月有提交条数上限（以官网为准，通常约 50 条/月）；超了可升级或换 Web3Forms。

### 方案 B：Web3Forms
1. 打开 web3forms.com → 输入你的收件邮箱 → 得到 **Access Key**。
2. Web3Forms 需要一个隐藏的 `access_key` 字段，代码里还没有，需加一行：用记事本/VSCode 打开 `components/inquiry-form.tsx`，找到这段（约第 56 行附近）：
   ```tsx
   {/* Formspree 附加字段（无端点时被忽略） */}
   {endpoint && (
     <input type="hidden" name="_subject" value="VEETOP website inquiry" />
   )}
   ```
   在 `_subject` 那一行下面加一行（把 `xxxxxxxx` 换成你的 Access Key；Web3Forms 的 Key 设计上允许放在前端，可公开）：
   ```tsx
   <input type="hidden" name="access_key" value="xxxxxxxx" />
   ```
3. 把 `site.config.ts` 的 `formEndpoint` 改为 **`https://api.web3forms.com/submit`**。
4. 执行 6.2 发布命令并在线测试。免费版每月提交量上限以官网为准。

### 收不到询盘时的检查顺序
① 发布是否完成（Vercel Deployments）→ ② 网页源码里 `form action` 是否已是端点地址（右键查看网页源代码搜 `formspree`/`web3forms`）→ ③ 到 Formspree/Web3Forms 后台看有没有收到 → ④ 是否本月免费额度用完 → ⑤ 垃圾邮件文件夹。

---

## 第 9 步：故障排查表与回滚

| 现象 | 可能原因 | 处理办法 |
|---|---|---|
| 域名打不开 / 浏览器提示不安全 | DNS 还没生效；或记录值抄错 | Vercel → Settings → Domains 看状态是否 Valid；`cmd` 里 `nslookup www.veetopamusement.com` 看指向；核对阿里云记录值是否与 Vercel/Cloudflare 页面**显示**的一致；等待几分钟到一天（DNS 生效时间） |
| 带 www 能开、不带 www 打不开（或反过来） | 只加了一条域名，或缺 `@` 的 A 记录 | 两条域名都在 Vercel Domains 添加；阿里云确认 `@` A 记录与 `www` CNAME 都在；可选做 3.4 的跳转 |
| 页面 404 / 某产品打不开 | 构建失败或 JSON 写错 | Vercel → Deployments → 点失败的那次看日志（红色报错里通常写着哪个文件）；多半是 `data/products/` 里 JSON 少逗号/引号；改好重新 push |
| 线上图片不显示 | ① CDN 变量没生效 ② R2 没传/路径不对 ③ 图名与 JSON 不一致 | 先看该图片直链（右键图→新标签打开）：若 404 → 到 R2 检查路径是否为 `images/products/同名文件`；若地址还是 `/images/...`（没有 cdn 域名）→ 第 5 步环境变量没配或改后没 Redeploy；JSON 里 `"images"` 地址是否和文件名一致 |
| 改完内容线上没变化 | 没 push；或部署失败；或浏览器缓存 | 确认执行了 `git push` 且 Vercel Deployments 出现新的一次并成功；`Ctrl + F5` 强刷；正常等待 1–3 分钟 |
| 询盘收不到 | 见第 8 步末尾检查顺序 | — |
| 改了 site.config / data 但页面没变化 | 忘记发布 | 执行 6.2 的 git add / commit / push 触发重新部署 |

**回滚（网页一键回旧版本）**：Vercel → Deployments → 找到上一个**成功**的部署 → 右侧 **⋯ → Promote to Production**（或 Redeploy），几秒内全站回到那个版本。之后再到本地改代码、重新 push 覆盖。
说明：产品图片存在 Cloudflare R2、是独立资产，**不随网页回滚**——网页回滚后图片仍是当前版本，这是预期行为（想还原图片就重新 `rclone copy` 旧图）。

---

## 第 10 步：常见问题与费用

**Q：需要买服务器或虚拟主机吗？**
不需要。这是纯静态网站，GitHub 存代码、Vercel 免费托管，没有服务器要维护。

**Q：需要买 SSL 证书吗？**
不需要。Vercel 对自定义域名自动签发并续期免费证书。

**Q：域名上的邮箱会受影响吗？**
只要按第 3 步只"添加记录"、不删 MX/TXT 记录，邮箱完全不受影响。网页只是把域名指向 Vercel，与邮件走不同的记录。

**Q：图片必须放 Cloudflare R2 吗？**
不是必须。**不设置 `NEXT_PUBLIC_CDN_URL`** 时图片自动走网站自身（Vercel 自带全球 CDN），图片不多时这样最简单——Vercel 免费额度内完全够用。R2 适合图片量大、想单独管理/省流量时使用；两种方式随时切换（改环境变量 + Redeploy 即可），代码无需改动。

**Q：每次更新都要找程序员吗？**
改产品资料/换图只要会"复制粘贴文件 + 复制三条命令"（6.2）就行，或干脆用 GitHub 网页版：github.com 仓库里点进 `data/products/` 任意 JSON → 铅笔图标编辑 → 页面下方 Commit changes（会写 "main" 分支），同样自动触发部署。页面版式/文案结构类改动再交给懂代码的人。

**Q：会不会被平台"跑路"或数据丢失？**
GitHub 存源码、本地还有一份完整副本，天然多地备份；Vercel/Cloudflare 都是业界主流。真要防患：每月把 `veetop-site` 文件夹整体压缩备份一次即可。

**费用汇总（均为当前常见免费额度，以各官网页面为准）**

| 项目 | 费用 |
|---|---|
| GitHub | 免费 |
| Vercel Hobby | 免费（含自定义域名、自动 HTTPS、每月约 100GB 流量；本项目纯静态远用不完） |
| Cloudflare R2 | 免费额度约 10GB 存储 + 每月固定量读写；图片出站流量无出口费；超出按量计费且很便宜 |
| 阿里云域名 | 续费费用（约每年几十元，以阿里云为准） |
| 询盘表单 | Formspree 免费版（月提交量约 50 条）或 Web3Forms 免费版（月提交量以官网为准），量大再考虑付费 |

> 价格与免费额度随时可能调整，本表仅为估算；正式决策前请以各官网"Pricing"页面为准。

---

## 附：常用命令速查（复制用）

```bash
# 本地预览（可选，需本机装有 Node.js）
npm install        # 第一次
npm run dev        # 开发预览 http://localhost:3000
npm run build      # 构建检查（能成功就说明没问题）
npx serve out -l 4173   # 预览正式构建产物 http://localhost:4173

# 发布更新（日常）
git add .
git commit -m "说明这次改了什么"
git push

# 生成产品示意图（新增产品暂无照片时）
node scripts/generate-placeholders.mjs

# 同步图片到 Cloudflare R2
rclone copy "本机路径\veetop-site\public\images" r2:veetop-assets --progress
```

**上线自检清单（最后核对一遍）**
- [ ] `site.config.ts` 联系方式与公司事实为真实值（已交付，复查一遍邮箱/号码即可）
- [ ] https://www.veetopamusement.com 打开正常、HTTPS 小锁正常、产品图显示正常
- [ ] 联系页表单提交后能在 Formspree/Web3Forms 后台收到
- [ ] 邮箱（MX/TXT 记录）没有被动过
- [ ] 把本手册与 README.md 保存好，交给负责更新的同事
