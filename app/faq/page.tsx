import type { Metadata } from "next";
import Link from "next/link";
import site from "@/site.config";
import ProductFaq from "@/components/product-faq";
import JsonLd from "@/components/json-ld";
import { siteBaseUrl } from "@/lib/cdn";

const baseUrl = siteBaseUrl(site.brand.domain);

export const metadata: Metadata = {
  title: "FAQ - Quotations, Payment, Delivery & OEM/ODM",
  description:
    "Answers to the questions buyers ask before ordering from VEETOP Amusement: manufacturer background, export markets, quotations, payment terms, lead time, certification (CE), OEM/ODM customization and factory visits.",
  alternates: { canonical: "/faq/" },
};

export default function FaqPage() {
  const faqs = site.faqs;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "FAQ",
        item: `${baseUrl}/faq/`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">FAQ</p>
          <h1>Trade Terms &amp; Buying FAQ</h1>
          <p className="lede lede--light">
            Everything buyers usually ask before placing an order - MOQ,
            payment, delivery, warranty, certifications and customization. If
            your question is not here, just ask us.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          <ProductFaq
            faqs={faqs}
            kicker="Buying Guide"
            title="Questions & Answers"
          />

          <div
            className="cta-inline"
            style={{
              marginTop: 44,
              textAlign: "center",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              background: "var(--surface)",
              padding: "30px 22px",
            }}
          >
            <h2 className="h-md">Still have a question?</h2>
            <p style={{ color: "var(--muted)", maxWidth: "52ch", margin: "0 auto 18px" }}>
              Send us your requirements - our export team will confirm pricing,
              MOQ and delivery time in the quotation.
            </p>
            <p style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact/" className="btn btn--accent">
                Ask a Question
              </Link>
              <a
                className="btn btn--dark"
                href={`https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(
                  site.contact.whatsapp.message,
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp Us
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
