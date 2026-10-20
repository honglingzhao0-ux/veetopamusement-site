import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getArticlesBySection,
} from "@/lib/articles";
import ArticleView, { buildArticleMetadata } from "@/components/article-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  // 栏目为空时返回空数组会让 output:"export" 构建失败，
  // 此时返回一个占位 slug，页面走 notFound()。
  const list = getArticlesBySection("news");
  return list.length > 0
    ? list.map((a) => ({ slug: a.slug }))
    : [{ slug: "__empty__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Page not found" };
  return buildArticleMetadata(article);
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article || article.section !== "news") notFound();
  const more = getArticlesBySection("news")
    .filter((a) => a.slug !== slug)
    .slice(0, 4);
  return <ArticleView article={article} more={more} />;
}
