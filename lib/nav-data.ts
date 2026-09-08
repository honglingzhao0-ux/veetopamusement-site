/**
 * 站点导航用目录树（仅服务端 / 构建期使用）。
 * 品类按 data/categories.json 顺序；每品类下取前 N 款代表产品
 * （getAllProducts 已按品类顺序 + 名称排序）。
 */
import { getCategories, getAllProducts } from "@/lib/products";

export interface NavProduct {
  slug: string;
  name: string;
  model: string;
}

export interface NavCategoryNode {
  slug: string;
  name: string;
  products: NavProduct[];
}

export function getCategoryNav(perProduct: number): NavCategoryNode[] {
  return getCategories().map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    products: getAllProducts()
      .filter((p) => p.category === cat.id)
      .slice(0, perProduct)
      .map((p) => ({ slug: p.slug, name: p.name, model: p.model })),
  }));
}
