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
