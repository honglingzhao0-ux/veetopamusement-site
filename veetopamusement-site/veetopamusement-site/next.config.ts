import type { NextConfig } from "next";

/**
 * Static export config:
 * - `output: "export"` 让 `next build` 产出纯静态文件到 out/
 *   （可直接由 Vercel 托管，或部署到任意静态主机 / Cloudflare Pages 等）
 * - `trailingSlash: true` 让产物为 out/products/xxx/index.html 结构，
 *   任何静态服务器都能直接以目录形式访问。
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
