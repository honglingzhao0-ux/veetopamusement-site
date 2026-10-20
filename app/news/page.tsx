import type { Metadata } from "next";
import Link from "next/link";
import { getArticlesBySection } from "@/lib/articles";

export const metadata: Metadata = {
  title: "News & Insights",
  description:
    "News and buying insights from VEETOP Amusement: catalogue updates, product line introductions and practical guides for sourcing arcade and amusement machines.",
  alternates: { canonical: "/news/" },
};

export default function NewsPage() {
  const posts = getArticlesBySection("news");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">News &amp; Insights</p>
          <h1>Updates from VEETOP</h1>
          <p className="lede lede--light">
            Product catalogue news, line introductions and practical guidance
            for sourcing amusement equipment.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="post-list">
            {posts.map((p) => (
              <article key={p.slug} className="post-card">
                <Link href={`/${p.pathPrefix}/${p.slug}/`} className="post-card__media">
                  <img
                    src={p.image}
                    alt={p.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
                <div className="post-card__body">
                  <div className="post-card__meta">
                    <span
                      className={
                        "chip" + (p.tag === "Product" ? " chip--accent" : "")
                      }
                    >
                      {p.tag}
                    </span>
                    <time dateTime={p.date}>{p.date}</time>
                  </div>
                  <h2 className="post-card__title">
                    <Link href={`/${p.pathPrefix}/${p.slug}/`}>{p.title}</Link>
                  </h2>
                  <p className="post-card__summary">{p.summary}</p>
                  <Link
                    href={`/${p.pathPrefix}/${p.slug}/`}
                    className="post-card__more"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
