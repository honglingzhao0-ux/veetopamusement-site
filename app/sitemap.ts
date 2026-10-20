import type { MetadataRoute } from "next";
import { execFileSync } from "node:child_process";
import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";
import {
  getAllProducts,
  getCategories,
  getCategorySlugForProduct,
} from "@/lib/products";
import { productPath } from "@/lib/product-url";

const baseUrl = siteBaseUrl(site.brand.domain);

/**
 * lastModified 取「内容最后一次真实变更的时间」。
 *
 * 为什么不用 new Date()：
 *   若全部用构建时间，每次构建所有 URL 的 lastmod 都变成当天，
 *   Google 会认为全站每天都在变 —— 既降低抓取优先级，
 *   也丢掉了「哪些页面真的更新过」这个信号（对新品页收录尤其不利）。
 *
 * 为什么用 git 提交时间而不是文件 mtime：
 *   git checkout 会把所有文件的 mtime 重置为检出时间（实测全站都变成当天），
 *   而提交时间才是内容真实的最后修改时刻。
 *
 * 一次性批量查询（git log --name-only），避免对 210 个产品各跑一次 git。
 */
const CONTENT_GIT_DATE = new Map<string, Date>();

function loadContentDates(paths: string[]): void {
  if (paths.length === 0) return;
  const uniq = Array.from(new Set(paths));
  try {
    const out = execFileSync(
      "git",
      [
        "log",
        "--name-only",
        "--pretty=format:%cI",
        "--",
        ...uniq,
      ],
      {
        encoding: "utf8",
        maxBuffer: 32 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"],
      }
    );
    // 格式：<时间戳>\n<file1>\n<file2>\n\n<时间戳>\n...
    const blocks = out.split(/\n(?=\d{4}-\d{2}-\d{2}T)/);
    for (const block of blocks) {
      const nl = block.indexOf("\n");
      if (nl < 0) continue;
      const d = new Date(block.slice(0, nl).trim());
      if (Number.isNaN(d.getTime())) continue;
      for (const line of block.slice(nl).split("\n")) {
        const f = line.trim();
        if (!f) continue;
        // git log 按新→旧遍历，首次出现即最后提交时间
        if (!CONTENT_GIT_DATE.has(f)) {
          CONTENT_GIT_DATE.set(f, d);
        }
      }
    }
  } catch {
    /* git 不可用时回退到构建时间 */
  }
}

function lastModifiedOf(relPath: string): Date {
  return CONTENT_GIT_DATE.get(relPath) ?? new Date();
}

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();
  const categories = getCategories();

  // 收集所有需要查询的源文件路径
  const tracked = [
    "app/page.tsx",
    "components/product-explorer.tsx",
    "app/about/page.tsx",
    "app/news/page.tsx",
    "app/blog/page.tsx",
    "app/faq/page.tsx",
    "app/contact/page.tsx",
    "data/categories.json",
    ...products.map((p) => `data/products/${p.slug}.json`),
  ];
  loadContentDates(tracked);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: lastModifiedOf("app/page.tsx"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products/`,
      lastModified: lastModifiedOf("components/product-explorer.tsx"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: lastModifiedOf("app/about/page.tsx"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news/`,
      lastModified: lastModifiedOf("app/news/page.tsx"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: lastModifiedOf("app/blog/page.tsx"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq/`,
      lastModified: lastModifiedOf("app/faq/page.tsx"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: lastModifiedOf("app/contact/page.tsx"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/products/${c.slug}/`,
    lastModified: lastModifiedOf("data/categories.json"),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}${productPath(getCategorySlugForProduct(p), p.slug)}`,
    lastModified: lastModifiedOf(`data/products/${p.slug}.json`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}