/**
 * 产品目录加载器（仅服务端 / 构建期使用）。
 *
 * 数据驱动设计：产品以单个 JSON 文件存放在 data/products/<slug>.json，
 * 新增一个 JSON（+ 对应图片）即会自动出现在列表页、品类页与详情页，
 * 无需改动任何页面代码。所有新字段均为"可选"，旧数据缺字段时自动回退默认值。
 */
import fs from "node:fs";
import path from "node:path";
import type { FaqItem } from "@/site.config";
import categoriesJson from "@/data/categories.json";

export interface Category {
  id: string;
  /** 品类独立着陆页 slug（URL: /products/<slug>/）。缺省回退为 id。 */
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  seoTitle: string;
  metaDescription: string;
  longIntro: string;
  faqs: FaqItem[];
  order: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  model: string;
  category: string;
  headline: string;
  description: string;
  images: string[];
  specs: ProductSpec[];
  features: string[];
  applications: string[];
  certifications: string[];
  /* ---- 以下为可选字段（旧数据缺省不影响构建） ---- */
  /** 起订量（B2B 询价制下通常不公开，留空则页面不展示） */
  moq?: number;
  /** 交期说明（留空则不展示；具体交期以报价为准） */
  leadTime?: string;
  /** 保修说明（留空则不展示） */
  warranty?: string;
  /** 人工撰写的 SEO description（优先于 description 截断回退） */
  seoDescription?: string;
  /** 产品级 FAQ（未配置时详情页使用站点级默认模板） */
  faqs?: FaqItem[];
  /** YouTube 演示视频 ID（有值才渲染播放器） */
  youtubeId?: string;
  /** 产品目录 PDF 路径（有值才渲染 Download Catalog 按钮） */
  catalogPdf?: string;
}

const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");

function normalizeCategory(raw: Record<string, unknown>, orderIndex: number): Category {
  const id = String(raw.id ?? "");
  return {
    id,
    slug: String(raw.slug ?? id),
    name: String(raw.name ?? id),
    tagline: String(raw.tagline ?? ""),
    blurb: String(raw.blurb ?? ""),
    seoTitle: String(raw.seoTitle ?? raw.name ?? id),
    metaDescription: String(raw.metaDescription ?? raw.blurb ?? ""),
    longIntro: String(raw.longIntro ?? raw.blurb ?? ""),
    faqs: Array.isArray(raw.faqs) ? (raw.faqs as FaqItem[]) : [],
    order: typeof raw.order === "number" ? raw.order : orderIndex,
  };
}

let _categories: Category[] | null = null;

export function getCategories(): Category[] {
  if (_categories) return _categories;
  const raw = categoriesJson as unknown as Record<string, unknown>[];
  _categories = raw
    .map((c, i) => normalizeCategory(c, i))
    .sort((a, b) => a.order - b.order);
  return _categories;
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getCategorySlugs(): string[] {
  return getCategories().map((c) => c.slug);
}

let _cache: Product[] | null = null;

export function getAllProducts(): Product[] {
  if (_cache) return _cache;
  const files = fs
    .readdirSync(PRODUCTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const orderMap = new Map(getCategories().map((c, i) => [c.id, i]));

  _cache = files
    .map((file) => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(PRODUCTS_DIR, file), "utf8"),
        ) as Product;
      } catch (err) {
        console.error(`[products] failed to parse ${file}:`, err);
        return null;
      }
    })
    .filter((p): p is Product => p !== null)
    .sort((a, b) => {
      const ca = orderMap.get(a.category) ?? 999;
      const cb = orderMap.get(b.category) ?? 999;
      if (ca !== cb) return ca - cb;
      return a.name.localeCompare(b.name);
    });
  return _cache;
}

export function getProductsByCategory(categoryId: string): Product[] {
  return getAllProducts().filter((p) => p.category === categoryId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return getAllProducts().map((p) => p.slug);
}
