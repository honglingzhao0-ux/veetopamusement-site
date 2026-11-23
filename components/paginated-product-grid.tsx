"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/product-card";
import { categoryPathWithPage } from "@/lib/product-url";

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
 *
 * 【页码与 URL 同步】（2026-11-23 加）
 * 之前页码只存在 useState 里，导致：
 *   · 浏览器后退 → 组件重挂载 → 回到第 1 页，丢失浏览位置
 *   · 刷新 / 分享链接 → 同样丢失
 * 现在：
 *   ① 初始页码从 URL 的 ?page=N 读取（后退、刷新、分享都能回到同一页）
 *   ② 切页时用 history.replaceState 同步 URL —— 用 replace 而非 push，
 *      避免把每次翻页都塞进浏览器后退栈（否则从第 3 页点进产品再「后退」
 *      会先退到第 2 页、再退到第 1 页，而不是直接回到第 3 页）
 *   ③ 产品链接带 ?from=N，详情页据此生成「返回第 N 页」的入口
 *
 * 滚动位置：非当前页的卡片用 position:absolute 移出可视区（不占文档流），
 * 所以每页高度一致 —— 页码恢复正确后，浏览器原生的滚动位置恢复即生效。
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

  /**
   * 挂载时从 URL 读页码。
   * 用 useEffect（不是 useSearchParams）—— 后者在静态导出下必须包 Suspense，
   * 会让整页降级为客户端渲染；这里直接读 window.location.search 更稳。
   */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const p = Number.parseInt(sp.get("page") ?? "1", 10);
    if (Number.isFinite(p) && p > 1 && p <= totalPages) {
      setPage(p);
    }
  }, [totalPages]);

  // 越界时回到最后一页
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  /**
   * 切页并同步 URL。
   * 用 replaceState 而不是 pushState：翻页不应该往浏览器后退栈里塞记录。
   */
  const goToPage = useCallback(
    (n: number) => {
      setPage(n);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", categoryPathWithPage(categorySlug, n));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [categorySlug]
  );

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

  if (sorted.length === 0) return null;

  return (
    <>
      <p className="result-note">
        Showing {(current - 1) * PAGE_SIZE + 1}-
        {Math.min(current * PAGE_SIZE, sorted.length)} of {sorted.length}{" "}
        {sorted.length === 1 ? "product" : "products"}
        {totalPages > 1 && ` (Page ${current} of ${totalPages})`}
      </p>

      {/*
       * 全部产品都渲染进 DOM，非当前页用 CSS 隐藏（.is-off-page）。
       *
       * 为什么不只渲染当前页：静态导出时 HTML 是唯一的爬虫入口，
       * Googlebot 不执行 JS —— 只渲染 16 个的话，其余产品页就成了
       * "孤岛页"（无任何内链指向），Google 不会收录它们。
       * 2026-10-20 的 Search Console 截图证实了这一问题：
       * 已收录 10 个 / 未收录 41 个，未收录的正是被分页藏起来的产品页。
       *
       * 做法：全量渲染 + CSS 隐藏，用户看到 16 个，爬虫拿到全部链接。
       */}
      <ul className="prod-grid prod-grid--catalog">
        {sorted.map((p, i) => {
          const onPage =
            i >= (current - 1) * PAGE_SIZE && i < current * PAGE_SIZE;
          return (
            <ProductCard
              key={p.slug}
              product={p}
              categorySlug={categorySlug}
              offPage={!onPage}
              /* 把来源页码带上，详情页可据此提供「返回第 N 页」 */
              fromPage={onPage ? current : undefined}
            />
          );
        })}
      </ul>

      {totalPages > 1 && (
        <nav className="pager" aria-label={label}>
          <button
            type="button"
            className="pager__btn"
            disabled={current === 1}
            onClick={() => goToPage(current - 1)}
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
                    onClick={() => goToPage(n)}
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
            onClick={() => goToPage(current + 1)}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}
