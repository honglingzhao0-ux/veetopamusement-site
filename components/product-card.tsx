import Link from "next/link";
import type { Product } from "@/lib/products";
import { cdnUrl } from "@/lib/cdn";

/**
 * 产品卡片（列表 / 首页推荐 / 相关产品共用）。
 * 图片地址一律经 cdnUrl() 处理（CDN 前缀或本地回退）。
 */
export default function ProductCard({ product }: { product: Product }) {
  const cover = product.images[0] ?? "/images/placeholder.svg";
  return (
    <li className="pcard">
      <Link href={`/products/${product.slug}/`} className="pcard__media">
        <div className="pcard__tags">
          {product.sample && <span className="badge-sample">Sample</span>}
        </div>
        <img
          src={cdnUrl(cover)}
          alt={`${product.name} (${product.model})`}
          loading="lazy"
        />
      </Link>
      <div className="pcard__body">
        <div className="pcard__model">{product.model}</div>
        <h3 className="pcard__name">
          <Link href={`/products/${product.slug}/`}>{product.name}</Link>
        </h3>
        <p className="pcard__desc">{product.headline}</p>
        <Link className="pcard__link" href={`/products/${product.slug}/`}>
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
