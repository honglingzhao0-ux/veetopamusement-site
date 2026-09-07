import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "News & Insights",
  description:
    "News and buying insights from VEETOP Amusement: catalogue updates, product line introductions and practical guides for sourcing arcade and amusement machines.",
  alternates: { canonical: "/news/" },
};

interface Post {
  tag: "Product" | "Guide";
  title: string;
  date: string;
  summary: string;
  href: string;
}

const POSTS: Post[] = [
  {
    tag: "Product",
    title: "Catalogue Now Online: 6 Product Lines, 33 Models",
    date: "2026-09-07",
    summary:
      "VEETOP's official catalogue is now presented online, covering six product lines - arcade video games and simulators, sports & skill games, redemption machines, claw cranes, kiddie rides and prize merchandisers - with OEM/ODM customization available on every line.",
    href: "/products/",
  },
  {
    tag: "Product",
    title: "From Claw Cranes to Kiddie Rides: A Tour of Our Product Lines",
    date: "2026-09-07",
    summary:
      "An introduction to the range we build: full-size simulators such as Super Bike III, redemption favourites like Ball Monster, Crane Machine A for mall locations and School Bus kiddie rides - each available factory-direct with CE certification.",
    href: "/products/",
  },
  {
    tag: "Guide",
    title: "How to Choose Amusement Machines for Your Venue",
    date: "2026-09-07",
    summary:
      "Before you buy: consider your floor space and target players, power supply and plugs in your market, spare parts and after-sales support, and how the machines will be shipped. Tell us these details and our export team will match models to your venue.",
    href: "/faq/",
  },
];

export default function NewsPage() {
  return (
    <section className="section">
      <div className="container container--narrow">
        <p className="kicker">News &amp; Insights</p>
        <h1 className="h-xl">Updates from VEETOP</h1>
        <p className="lede">
          Product catalogue news, line introductions and practical guidance
          for sourcing amusement equipment.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 44 }}>
          {POSTS.map((p) => (
            <article
              key={p.title}
              style={{
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "26px 28px",
                background: "var(--surface)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <span className={"chip" + (p.tag === "Product" ? " chip--accent" : "")}>
                  {p.tag}
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  {p.date}
                </span>
              </div>
              <h2 style={{ fontSize: "1.25rem", marginBottom: 8 }}>
                <Link href={p.href}>{p.title}</Link>
              </h2>
              <p style={{ color: "var(--ink-2)", margin: 0 }}>{p.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
