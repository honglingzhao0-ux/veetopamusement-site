import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog & Buying Guides",
  description:
    "Buying guides from VEETOP Amusement: practical advice on choosing claw cranes, arcade simulators, redemption machines and other amusement equipment for your venue.",
  alternates: { canonical: "/blog/" },
};

interface Post {
  tag: "Guide";
  title: string;
  date: string;
  summary: string;
  href: string;
}

const POSTS: Post[] = [
  {
    tag: "Guide",
    title: "Claw Crane Buying Guide: Cabinets, Prizes and Placement",
    date: "2026-09-07",
    summary:
      "Claw machines come in very different formats: compact countertop units such as the Mini Crane Machine, standard single cabinets like the Crane Machine A, key-style games such as Key Master and wider twin cabinets like the Luxury Twins Crane Machine. Match the cabinet to your space, and choose a prize size and type the model can actually hold - our team can advise on suitable models for malls, supermarkets and retail corridors.",
    href: "/products/claw-crane-machines/",
  },
  {
    tag: "Guide",
    title: "Motion Simulators vs Upright Arcade Games: What Fits Your Floor",
    date: "2026-09-07",
    summary:
      "Full-size motion simulators such as the Super Bike III, Dynamic Moto 3 DX and Cruis'N Blast Ver.2 Motion draw attention with moving cabinets, but they need more floor space. Upright cabinets such as the 32'' Arcade Game (Wooden Cabinet) take less room and suit tighter layouts. Consider the space, power and audience of each location before choosing between full-size and single-player formats.",
    href: "/products/arcade-video-games/",
  },
  {
    tag: "Guide",
    title: "Building a Ticket Economy: Redemption Machines That Keep Players Coming Back",
    date: "2026-09-07",
    summary:
      "Redemption machines award tickets or prizes based on skill and score, which gives players a reason to return. Ball shooting games like Ball Monster and Monster Realms Balls Shooting, plus compact favourites such as Flappy Bird, fit different floor plans and player ages. Ticket settings can be configured to your operation - specify your difficulty or payout preference when ordering.",
    href: "/products/redemption-ticket-games/",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">Blog &amp; Buying Guides</p>
          <h1>Guides for Your Venue</h1>
          <p className="lede lede--light">
            Practical, machine-focused buying guidance drawn from the VEETOP
            product range - no market hype, just what to look for.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">

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
                <span className="chip chip--accent">{p.tag}</span>
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
    </>
  );
}
