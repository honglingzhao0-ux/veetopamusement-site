"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/products";
import ProductCard from "@/components/product-card";

export interface ExplorerProps {
  categories: Pick<Category, "id" | "name" | "slug">[];
  products: Product[];
}

/**
 * 全目录本地筛选器（客户端）。
 * 说明：品类"独立索引页"由 /products/<slug>/ 承担（SEO 入口），
 * 本组件只是 /products/ 全目录页的浏览便利（按钮筛选，不产生 URL 变体）。
 */
export default function ProductExplorer({ categories, products }: ExplorerProps) {
  const [active, setActive] = useState<string>("all");
  // 客户端组件不能引用 lib/products.ts（依赖 node:fs），品类 slug 由父级服务端组件传入。
  const slugById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.slug])),
    [categories],
  );

  const list = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  const activeName =
    active === "all"
      ? "All Products"
      : categories.find((c) => c.id === active)?.name ?? "All Products";

  return (
    <>
      <div className="filter-bar" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={"filter-btn" + (active === "all" ? " is-on" : "")}
          onClick={() => setActive("all")}
        >
          All ({products.length})
        </button>
        {categories.map((c) => {
          const n = products.filter((p) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              className={"filter-btn" + (active === c.id ? " is-on" : "")}
              onClick={() => setActive(c.id)}
            >
              {c.name} ({n})
            </button>
          );
        })}
      </div>

      <p className="result-note">
        Showing {list.length} {list.length === 1 ? "product" : "products"} -{" "}
        {activeName}
      </p>

      {list.length > 0 ? (
        <ul className="prod-grid">
          {list.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              categorySlug={slugById.get(p.category) ?? ""}
            />
          ))}
        </ul>
      ) : (
        <p>No products in this category yet.</p>
      )}
    </>
  );
}
