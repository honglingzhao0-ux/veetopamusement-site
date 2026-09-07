import type { MetadataRoute } from "next";
import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";
import { getAllProducts, getCategories } from "@/lib/products";

const baseUrl = siteBaseUrl(site.brand.domain);
const lastModified = new Date();

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${baseUrl}/products/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: `${baseUrl}/products/${c.slug}/`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const productPages: MetadataRoute.Sitemap = getAllProducts().map((p) => ({
    url: `${baseUrl}/products/${p.slug}/`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
