/**
 * 产品 / 品类 URL 构造（不含域名）。
 *
 * 单独成文件的原因：ProductCard 会被 `"use client"` 的 ProductExplorer 引入，
 * 而 lib/products.ts 依赖 node:fs，客户端组件不能引用它。此处只做纯字符串拼接。
 *
 * URL 层级与页面面包屑一致：Home / Products / 品类 / 产品。
 */

/** 品类着陆页：/products/<品类slug>/ */
export function categoryPath(categorySlug: string): string {
  return `/products/${categorySlug}/`;
}

/**
 * 产品详情页：/products/<品类slug>/<产品slug>/
 *
 * 品类段缺失时回退到目录页 /products/，绝不回退到旧的扁平写法
 * （扁平路径仅允许存在于 vercel.json 的 301 重定向源中）。
 */
export function productPath(
  categorySlug: string | undefined,
  productSlug: string,
): string {
  if (!categorySlug) return "/products/";
  return `/products/${categorySlug}/${productSlug}/`;
}

/**
 * 带「来源页码」的产品链接：/products/<品类slug>/<产品slug>/?from=3
 *
 * 用途：从列表页第 3 页点进产品详情后，页面能生成
 * 「← 返回 <品类>（第 3 页）」的链接；浏览器后退时也能恢复原页码。
 *
 * fromPage 省略或 ≤ 1 时不追加参数 —— 保持第一页的链接干净。
 * ⚠️ 产品页 canonical 固定为不带参版本，SEO 不受影响。
 */
export function productPathWithFrom(
  categorySlug: string | undefined,
  productSlug: string,
  fromPage?: number,
): string {
  const base = productPath(categorySlug, productSlug);
  if (!fromPage || fromPage <= 1) return base;
  return `${base}?from=${fromPage}`;
}

/**
 * 列表页带页码的 URL：/products/<品类slug>/?page=3
 *
 * 页码写进 URL 的意义：刷新、分享、浏览器后退都能回到同一页。
 * 静态导出下 ?page=N 与第一页是同一份 HTML，Google 看到的内容不变，
 * canonical 也固定指向不带参版本，所以 SEO 无损。
 */
export function categoryPathWithPage(
  categorySlug: string,
  page?: number,
): string {
  const base = categoryPath(categorySlug);
  if (!page || page <= 1) return base;
  return `${base}?page=${page}`;
}
