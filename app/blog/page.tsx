import type { Metadata } from "next";
import Link from "next/link";
import { getArticlesBySection } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Blog & Buying Guides",
  description:
    "Buying guides from VEETOP Amusement: practical advice on choosing claw cranes, arcade simulators, redemption machines and other amusement equipment for your venue.",
  alternates: { canonical: "/blog/" },
};

export default function BlogPage() {
  const posts = getArticlesBySection("guide");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">Blog &amp; Buying Guides</p>
          <h1>Practical advice for amusement operators</h1>
          <p className="lede lede--light">
            Guides on equipment selection, floor planning and running economics
            for family entertainment centres, arcades and mall operators.
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
