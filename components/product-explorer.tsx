"use client";

import { useMemo, useState, useEffect } from "react";
import type { Category, Product } from "@/lib/products";
import ProductCard from "@/components/product-card";

export interface ExplorerProps {
  categories: Pick<Category, "id" | "name" | "slug">[];
  products: Product[];
}

/** 每页 16 个（4 行 × 4 列） */
const PAGE_SIZE = 16;

/**
 * 品类按业务线分组展示。
 * 210 个型号平铺成一排很难扫，按业务线分组后定位快得多。
 * 每个分组下的 "All N" = 该业务线合计产品数。
 */
const GROUPS: Record<string, string[]> = {
  "Coin-operated arcade": ["arcade-video-games", "sports-skill-games"],
  "Redemption & prize": ["redemption-ticket-games", "prize-merchandisers"],
  "Crane & kiddie": ["claw-crane-machines", "kiddie-rides"],
};

const GROUP_ORDER = [
  "Coin-operated arcade",
  "Redemption & prize",
  "Crane & kiddie",
];

function groupOf(catId: string): string {
  for (const [g, ids] of Object.entries(GROUPS)) {
    if (ids.includes(catId)) return g;
  }
  return "Other";
}

/** 型号排序：字母数字混排时按数字大小比较（VTRA9 < VTRA10） */
function compareModel(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

export default function ProductExplorer({
  categories,
  products,
}: ExplorerProps) {
  const [active, setActive] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<string>("");

  // 客户端组件不能引用 lib/products.ts（依赖 node:fs），slug 由父级传入
  const slugById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.slug])),
    [categories]
  );

  const countOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of categories) {
      m.set(c.id, products.filter((p) => p.category === c.id).length);
    }
    return m;
  }, [categories, products]);

  const list = useMemo(() => {
    let filtered =
      active === "all"
        ? products
        : products.filter((p) => p.category === active);

    // 关键词搜索：型号 / 名称 / 标题 / 品类（不区分大小写）
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.model.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.headline ?? "").toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return [...filtered].sort((a, b) => compareModel(a.model, b.model));
  }, [active, products, query]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);

  // 切换品类或搜索词时回到第 1 页
  useEffect(() => {
    setPage(1);
  }, [active, query]);

  // 页数变化后如果当前页越界，回到最后一页
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const activeName =
    active === "all"
      ? "All Products"
      : categories.find((c) => c.id === active)?.name ?? "All Products";

  /** 页码序列：1 … 4 5 [6] 7 8 … 23 */
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const out: Array<number | "..."> = [1];
    const from = Math.max(2, current - 1);
    const to = Math.min(totalPages - 1, current + 1);
    if (from > 2) out.push("...");
    for (let i = from; i <= to; i++) out.push(i);
    if (to < totalPages - 1) out.push("...");
    out.push(totalPages);
    return out;
  }, [current, totalPages]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* 搜索 + 分组筛选 */}
      <div className="explorer-filter">
        <div className="explorer-search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model or keyword — e.g. VTRA010, claw crane, kiddie ride"
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              className="explorer-search__clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 顶部一级筛选（保持原有交互，便于快速切换） */}
        <div className="filter-bar" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={"filter-btn" + (active === "all" ? " is-on" : "")}
            onClick={() => setActive("all")}
          >
            All {products.length}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={
                "filter-btn" +
                (active === c.id ? " is-on" : "") +
                ((countOf.get(c.id) ?? 0) === 0 ? " is-empty" : "")
              }
              onClick={() => setActive(c.id)}
            >
              {c.name} <span className="filter-btn__n">{countOf.get(c.id) ?? 0}</span>
            </button>
          ))}
        </div>

        {/* 按业务线分组 */}
        <div className="explorer-groups">
          {GROUP_ORDER.map((g) => {
            const cats = categories.filter((c) => groupOf(c.id) === g);
            if (cats.length === 0) return null;
            const groupTotal = cats.reduce(
              (sum, c) => sum + (countOf.get(c.id) ?? 0),
              0
            );
            return (
              <div key={g} className="explorer-group">
                <span className="explorer-group__label">{g}</span>
                <div className="filter-bar" role="group" aria-label={g}>
                  <button
                    type="button"
                    className={
                      "filter-btn" + (active === "all" ? " is-on" : "")
                    }
                    onClick={() => setActive("all")}
                  >
                    All {groupTotal}
                  </button>
                  {cats.map((c) => {
                    const n = countOf.get(c.id) ?? 0;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={
                          "filter-btn" +
                          (active === c.id ? " is-on" : "") +
                          (n === 0 ? " is-empty" : "")
                        }
                        onClick={() => setActive(c.id)}
                      >
                        {c.name} <span className="filter-btn__n">{n}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="result-note">
        {list.length > 0 ? (
          <>
            Showing {(current - 1) * PAGE_SIZE + 1}-
            {Math.min(current * PAGE_SIZE, list.length)} of {list.length}{" "}
            {list.length === 1 ? "product" : "products"}
            {query.trim() && (
              <>
                {" "}matching <strong>&quot;{query.trim()}&quot;</strong>
              </>
            )}
            {!query.trim() && <> — {activeName}</>}
            {totalPages > 1 && ` (Page ${current} of ${totalPages})`}
          </>
        ) : (
          <>
            No products found
            {query.trim() && (
              <>
                {" "}for <strong>&quot;{query.trim()}&quot;</strong>
              </>
            )}
            . Try another keyword or pick a different category.
          </>
        )}
      </p>

      {list.length > 0 ? (
        /*
         * 全部（筛选后的）产品都渲染进 DOM，非当前页用 CSS 隐藏。
         * 理由同 components/paginated-product-grid.tsx：
         * 静态 HTML 是爬虫唯一入口，只渲染 16 个会让其余产品页变成孤岛页。
         */
        <ul className="prod-grid prod-grid--catalog">
          {list.map((p, i) => {
            const onPage =
              i >= (current - 1) * PAGE_SIZE && i < current * PAGE_SIZE;
            return (
              <ProductCard
                key={p.slug}
                product={p}
                categorySlug={slugById.get(p.category) ?? ""}
                offPage={!onPage}
              />
            );
          })}
        </ul>
      ) : (
        <p>No products in this category yet.</p>
      )}

      {totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button
            type="button"
            className="pager__btn"
            disabled={current === 1}
            onClick={() => {
              setPage(current - 1);
              scrollTop();
            }}
          >
            ← Prev
          </button>

          <ul className="pager__list">
            {pageNumbers.map((n, i) =>
              n === "..." ? (
                <li key={`gap-${i}`} className="pager__gap" aria-hidden="true">
                  …
                </li>
              ) : (
                <li key={n}>
                  <button
                    type="button"
                    className={
                      "pager__btn pager__btn--num" +
                      (n === current ? " is-on" : "")
                    }
                    aria-current={n === current ? "page" : undefined}
                    onClick={() => {
                      setPage(n);
                      scrollTop();
                    }}
                  >
                    {n}
                  </button>
                </li>
              )
            )}
          </ul>

          <button
            type="button"
            className="pager__btn"
            disabled={current === totalPages}
            onClick={() => {
              setPage(current + 1);
              scrollTop();
            }}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}