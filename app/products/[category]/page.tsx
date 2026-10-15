import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategorySlugs,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/products";
import CategoryLanding from "@/components/category-landing";

interface Props {
  params: Promise<{ category: string }>;
}

/**
 * 品类着陆页：/products/<品类slug>/
 * 与产品详情页 /products/<品类slug>/<产品slug>/ 分层，使 URL 层级与页面
 * 面包屑（Home / Products / 品类 / 产品）一致。品类 URL 本身保持不变。
 */
export function generateStaticParams() {
  return getCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: "Page not found" };

  return {
    title: category.seoTitle,
    description: category.metaDescription,
    alternates: { canonical: `/products/${category.slug}/` },
    openGraph: {
      type: "website",
      title: category.seoTitle,
      description: category.metaDescription,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  return (
    <CategoryLanding
      category={category}
      products={getProductsByCategory(category.id)}
    />
  );
}
