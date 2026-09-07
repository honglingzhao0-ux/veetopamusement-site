/**
 * 图片 / 静态资源 URL 统一出口。
 *
 * 规则：
 *  - 配置了 NEXT_PUBLIC_CDN_URL（将来指向 Cloudflare R2 公开域名）时，
 *    所有以 "/images/..." 开头的地址自动拼接 CDN 前缀；
 *  - 未配置时原样返回本地地址（开发、构建预览、Vercel 上均可直接显示）；
 *  - 已是完整 http(s) 地址的（第三方图、用户后续填入的绝对地址）不做处理。
 *
 * 页面里永远不要手写图片地址，一律 import { cdnUrl } from "@/lib/cdn";
 */
const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_URL ?? "").trim().replace(/\/+$/, "");

export function cdnUrl(src: string): string {
  if (!src) return src;
  if (/^(https?:)?\/\//i.test(src)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return CDN_BASE ? `${CDN_BASE}${path}` : path;
}

/** 站点绝对基址（用于 sitemap / JSON-LD / canonical），可被 NEXT_PUBLIC_SITE_URL 覆盖 */
export function siteBaseUrl(fallback: string): string {
  const env = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (env) return env;
  return fallback.replace(/\/+$/, "");
}
