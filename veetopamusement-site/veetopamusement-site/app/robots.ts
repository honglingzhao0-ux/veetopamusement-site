import type { MetadataRoute } from "next";
import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";

const baseUrl = siteBaseUrl(site.brand.domain);

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
