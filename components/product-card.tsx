import Link from "next/link";
import type { Product } from "@/lib/products";
import { cdnUrl } from "@/lib/cdn";
import { productPath } from "@/lib/product-url";

/**
 * 产品卡片（列表 / 首页推荐 / 相关产品共用）。
 * 图片地址一律经 cdnUrl() 处理（CDN 前缀或本地回退）。
 * categorySlug 必传：产品 URL 必须带品类段，与详情页面包屑层级一致。
 */
export default function ProductCard({
  product,
  categorySlug,
  offPage = false,
}: {
  product: Product;
  categorySlug: string;
  /**
   * 是否为「非当前分页」的产品。
   * 用于分页场景：卡片仍在 HTML 里（爬虫能发现链接），
   * 只是被 CSS 隐藏（用户看不到）。详见 components/paginated-product-grid.tsx。
   */
  offPage?: boolean;
}) {
  const href = productPath(categorySlug, product.slug);
  const cover = product.images[0] ?? "/images/placeholder.svg";
  return (
    <li
      className={"pcard" + (offPage ? " is-off-page" : "")}
      data-track-product={product.model}
    >
      <Link href={href} className="pcard__media">
        <img
          src={cdnUrl(cover)}
          alt={`${product.name} (${product.model})`}
          loading="lazy"
        />
      </Link>
      <div className="pcard__body">
        <div className="pcard__model">{product.model}</div>
        <h3 className="pcard__name">
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="pcard__desc">{product.headline}</p>
        <Link className="pcard__link" href={href}>
          View Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14m0 0-6-6m6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </li>
  );
}
