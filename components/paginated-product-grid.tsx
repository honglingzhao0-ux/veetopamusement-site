"use client";

import { useMemo, useState, useEffect } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/product-card";

/** 每页 16 个（4 行 × 4 列） */
const PAGE_SIZE = 16;

/** 型号排序：自然序（VTRA9 排在 VTRA10 前，而非字符串序） */
function compareModel(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

interface Props {
  products: Product[];
  categorySlug: string;
  /** 无障碍标签，例如 "Pagination" */
  label?: string;
}

/**
 * 可分页的产品网格（客户端组件）
 *
 * 用在品类着陆页/ products 总览页：每页 16 个，桌面 4 列。
 * ⚠️ 分页只在客户端切页，静态导出时全部产品仍渲染在 HTML 里
 *    （搜索引擎看到的仍是完整列表），这里只是把 DOM 分批显示。
 */
export default function PaginatedProductGrid({
  products,
  categorySlug,
  label = "Pagination",
}: Props) {
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () => [...products].sort((a, b) => compareModel(a.model, b.model)),
    [products]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  // 越界时回到最后一页
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  /** 页码序列：1 … 4 5 [6] 7 8 … 14 */
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

  if (sorted.length === 0) return null;

  return (
    <>
      <p className="result-note">
        Showing {(current - 1) * PAGE_SIZE + 1}-
        {Math.min(current * PAGE_SIZE, sorted.length)} of {sorted.length}{" "}
        {sorted.length === 1 ? "product" : "products"}
        {totalPages > 1 && ` (Page ${current} of ${totalPages})`}
      </p>

      <ul className="prod-grid prod-grid--catalog">
        {pageItems.map((p) => (
          <ProductCard
            key={p.slug}
            product={p}
            categorySlug={categorySlug}
          />
        ))}
      </ul>

      {totalPages > 1 && (
        <nav className="pager" aria-label={label}>
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