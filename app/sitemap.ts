import type { MetadataRoute } from "next";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";
import {
  getAllProducts,
  getCategories,
  getCategorySlugForProduct,
} from "@/lib/products";
import { getAllArticles } from "@/lib/articles";
import { productPath } from "@/lib/product-url";

const baseUrl = siteBaseUrl(site.brand.domain);

/**
 * lastModified：反映「内容最后一次真实变更的时间」。
 *
 * 为什么不用 new Date()：
 *   全部用构建时间的话，每次构建所有 URL 的 lastmod 都变成当天，
 *   Google 会认为全站每天都在变 —— 既降低抓取优先级，
 *   也丢掉了「哪些页面真的更新过」这个信号（对新品页收录尤其不利）。
 *
 * 为什么不用 git 提交时间：
 *   Vercel 构建环境没有 .git 目录，git log 会失败并回退。
 *   （本地验证有效、线上失效 —— 必须避免这种"本地好用线上不生效"的坑）
 *
 * 实际方案：内容哈希 + 变更时间戳双写
 *   - 在构建时把「内容哈希 → 首次出现时间」记录到 data/.content-dates.json
 *   - 内容哈希不变 → 沿用上次记录的时间（真正没变，lastmod 不动）
 *   - 内容哈希变了 → 用当前时间（真的改了，更新 lastmod）
 *   这样 lastmod 只在内容真实变化时才动，与 git 无关，线上也可靠。
 */
const DATES_FILE = path.join(process.cwd(), "data", ".content-dates.json");

type DateMap = Record<string, string>;

function readDates(): DateMap {
  try {
    if (fs.existsSync(DATES_FILE)) {
      return JSON.parse(fs.readFileSync(DATES_FILE, "utf8")) as DateMap;
    }
  } catch {
    /* 忽略 */
  }
  return {};
}

function hashContent(content: string): string {
  return createHash("sha1").update(content).digest("hex").slice(0, 16);
}

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();
  const categories = getCategories();

  const prev = readDates();
  const next: DateMap = { ...prev };
  const nowIso = new Date().toISOString();

  /** 取内容真实最后修改时间：哈希变则用现在，否则沿用历史 */
  function lastModifiedOf(relPath: string, content: string): Date {
    let contentHash: string;
    try {
      contentHash = hashContent(
        fs.readFileSync(path.join(process.cwd(), relPath), "utf8")
      );
    } catch {
      contentHash = "missing";
    }
    const key = `${relPath}:${contentHash}`;
    if (!next[key]) {
      next[key] = nowIso;
    }
    return new Date(next[key]);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: lastModifiedOf("app/page.tsx", ""),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products/`,
      lastModified: lastModifiedOf("components/product-explorer.tsx", ""),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: lastModifiedOf("app/about/page.tsx", ""),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news/`,
      lastModified: lastModifiedOf("app/news/page.tsx", ""),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: lastModifiedOf("app/blog/page.tsx", ""),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq/`,
      lastModified: lastModifiedOf("app/faq/page.tsx", ""),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: lastModifiedOf("app/contact/page.tsx", ""),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/products/${c.slug}/`,
    lastModified: lastModifiedOf("data/categories.json", ""),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}${productPath(getCategorySlugForProduct(p), p.slug)}`,
    lastModified: lastModifiedOf(`data/products/${p.slug}.json`, ""),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 文章页：lastModified 用文章自身的发表/更新日期（内容哈希对 .md 同样适用）
  const articlePages: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${baseUrl}/${a.pathPrefix}/${a.slug}/`,
    lastModified: lastModifiedOf(`data/articles/${a.slug}.md`, ""),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // 写回变更记录（供下次构建比对）；失败不影响构建
  try {
    fs.writeFileSync(DATES_FILE, JSON.stringify(next, null, 2) + "\n", "utf8");
  } catch {
    /* 只读文件系统环境（如某些 CI）会失败，忽略即可 */
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...articlePages,
  ];
}