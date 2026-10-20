import Link from "next/link";
import type { Metadata } from "next";
import site from "@/site.config";
import { siteBaseUrl, cdnUrl } from "@/lib/cdn";
import type { Article } from "@/lib/articles";
import JsonLd from "@/components/json-ld";

const baseUrl = siteBaseUrl(site.brand.domain);

interface Props {
  article: Article;
  /** 相关的同栏目文章 */
  more: Article[];
}

/**
 * 文章详情页
 *
 * 用途：让 Google 能收录完整正文（列表页只有摘要，不足以被收录）。
 * 结构化数据用 BlogPosting + BreadcrumbList。
 */
export default function ArticleView({ article, more }: Props) {
  const canonical = `${baseUrl}/${article.pathPrefix}/${article.slug}/`;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    image: cdnUrl(article.image),
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: site.brand.legalName,
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: site.brand.legalName,
      url: baseUrl,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "en",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: article.section === "news" ? "News" : "Blog",
        item: `${baseUrl}/${article.pathPrefix}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonical,
      },
    ],
  };

  const sectionName = article.section === "news" ? "News" : "Buying Guides";

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href={`/${article.pathPrefix}/`}>{sectionName}</Link>
          </nav>
          <div className="post-hero__meta">
            <span className={"chip" + (article.tag === "Product" ? " chip--accent" : "")}>
              {article.tag}
            </span>
            <time dateTime={article.date} className="post-hero__date">
              {article.date}
            </time>
          </div>
          <h1 className="post-hero__title">{article.title}</h1>
          <p className="lede lede--light">{article.summary}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="post-layout">
            <article className="post-body">
              <figure className="post-body__cover">
                <img
                  src={cdnUrl(article.image)}
                  alt={article.imageAlt}
                  loading="eager"
                  decoding="async"
                />
              </figure>

              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: article.html }}
              />

              <div className="post-cta">
                <p>
                  Tell us your venue type, floor area, target market and quantity,
                  and our export team will propose a machine mix with confirmed
                  pricing, MOQ and delivery timing.
                </p>
                <div className="post-cta__actions">
                  <Link href="/contact/" className="btn btn--accent">
                    Request a Quote
                  </Link>
                  <Link href="/products/" className="btn btn--line">
                    Browse All Products
                  </Link>
                </div>
              </div>
            </article>

            <aside className="post-side">
              <div className="post-side__box">
                <h2 className="post-side__title">Why VEETOP</h2>
                <ul className="post-side__list">
                  <li>
                    <strong>{site.companyFacts.yearsInBusiness} years</strong> in
                    amusement equipment manufacturing
                  </li>
                  <li>
                    Exports to <strong>{site.companyFacts.exportCountries} countries</strong>
                  </li>
                  <li>CE certified, OEM / ODM on all product lines</li>
                  <li>Spare parts support for exported machines</li>
                </ul>
                <Link href="/about/" className="post-side__link">
                  About our factory →
                </Link>
              </div>

              {more.length > 0 && (
                <div className="post-side__box">
                  <h2 className="post-side__title">
                    {article.section === "news" ? "More news" : "More guides"}
                  </h2>
                  <ul className="post-side__more">
                    {more.map((a) => (
                      <li key={a.slug}>
                        <Link href={`/${a.pathPrefix}/${a.slug}/`}>{a.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

export function buildArticleMetadata(article: Article): Metadata {
  const canonical = `${baseUrl}/${article.pathPrefix}/${article.slug}/`;
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `${article.pathPrefix}/${article.slug}/` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: canonical,
      publishedTime: article.date,
      images: [
        { url: cdnUrl(article.image), alt: article.imageAlt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [cdnUrl(article.image)],
    },
  };
}
