"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryPathWithPage } from "@/lib/product-url";

/**
 * 「返回列表」入口（产品详情页）
 *
 * 解决的问题（2026-11-23）：
 *   用户在品类列表第 3 页找到产品 → 点进详情 → 想回去，
 *   面包屑只能回到品类页第 1 页，要再点两次 Next 才找得到刚才看的机器。
 *
 * 做法：
 *   ① 从 URL 的 ?from=N 读取来源页码（列表页点产品时带上）
 *   ② 显示「← 返回 <品类名>（第 N 页）」，链接指向 /products/<品类>/?page=N
 *   ③ 没有 ?from 时（直接访问/搜索进入）退回普通面包屑式的「← 返回 <品类名>」
 *
 * ⚠️ 用 useEffect 读 window.location.search 而不是 useSearchParams：
 *    后者在静态导出下必须包 Suspense，会让整页降级为客户端渲染。
 */
export default function BackToList({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName: string;
}) {
  const [fromPage, setFromPage] = useState<number | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const p = Number.parseInt(sp.get("from") ?? "", 10);
    setFromPage(Number.isFinite(p) && p > 1 ? p : null);
  }, []);

  // 首帧还没读到参数时先不渲染，避免闪一下再变形
  if (fromPage === null) return null;

  const href = categoryPathWithPage(categorySlug, fromPage);

  return (
    <Link className="back-to-list" href={href}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M19 12H5M12 19l-7-7 7-7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        Back to {categoryName}
        {fromPage > 1 && (
          <em className="back-to-list__page"> (page {fromPage})</em>
        )}
      </span>
    </Link>
  );
}
