import type { Metadata } from "next";
import Link from "next/link";
import site from "@/site.config";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for your inquiry to VEETOP Amusement.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  const c = site.contact;
  return (
    <section className="section">
      <div className="container container--narrow">
        <div
          style={{
            textAlign: "center",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
            padding: "56px 30px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 74,
              height: 74,
              margin: "0 auto 22px",
              borderRadius: "50%",
              background: "var(--accent-soft)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6 9 17l-5-5"
                stroke="#f4511e"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="kicker" style={{ justifyContent: "center" }}>
            Inquiry Received
          </p>
          <h1 className="h-xl">Thank You for Contacting VEETOP</h1>
          <p className="lede" style={{ margin: "0 auto 8px" }}>
            Your inquiry has been sent successfully. Our export team will
            confirm pricing, MOQ and delivery time in the quotation.
          </p>
          <p style={{ color: "var(--muted)", marginBottom: 26 }}>
            Need a faster answer? Reach us directly on WhatsApp or email.
          </p>
          <p
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              className="btn whatsapp-btn"
              href={`https://wa.me/${c.whatsapp.number}?text=${encodeURIComponent(
                c.whatsapp.message,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Us
            </a>
            <a className="btn btn--dark" href={`mailto:${c.email}`}>
              Email Sales
            </a>
            <Link href="/products/" className="btn btn--line">
              Browse Products
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
