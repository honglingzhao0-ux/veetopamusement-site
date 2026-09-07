import Link from "next/link";
import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";
import type { Category, Product } from "@/lib/products";
import JsonLd from "@/components/json-ld";
import ProductCard from "@/components/product-card";
import ProductFaq from "@/components/product-faq";

const baseUrl = siteBaseUrl(site.brand.domain);

interface CategoryLandingProps {
  category: Category;
  products: Product[];
}

/**
 * 品类独立关键词着陆页（P0-1）。
 * 输出 BreadcrumbList + ItemList + FAQPage 三类 JSON-LD 与独立语义结构；
 * 由 app/products/[slug]/page.tsx 在 slug 命中品类时渲染。
 */
export default function CategoryLanding({
  category,
  products,
}: CategoryLandingProps) {
  const h1 = category.seoTitle.split("|")[0].trim() || category.name;
  const introParagraphs = category.longIntro
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${baseUrl}/products/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${baseUrl}/products/${category.slug}/`,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.seoTitle,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/products/${p.slug}/`,
      name: `${p.name} (${p.model})`,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: category.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />
      {category.faqs.length > 0 && <JsonLd data={faqJsonLd} />}

      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">Product Category</p>
          <h1>{h1}</h1>
          <p className="lede lede--light">
            {category.tagline}. {products.length} models in this line - factory
            direct with OEM/ODM support.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/products/">Products</Link>
            <span className="sep">/</span>
            <span>{category.name}</span>
          </nav>

          <div className="cat-intro">
            {introParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="section-head" style={{ marginTop: 44 }}>
            <div>
              <p className="kicker">In This Line</p>
              <h2 className="h-lg">{category.name} - Product Range</h2>
              <p>Click any model to see full specs, photos and trade terms.</p>
            </div>
            <Link href="/contact/" className="btn btn--accent">
              Get a Quote
            </Link>
          </div>

          {products.length > 0 ? (
            <ul className="prod-grid">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </ul>
          ) : (
            <p>
              No products published in this category yet - contact us for the
              full catalog.
            </p>
          )}

          {category.faqs.length > 0 && (
            <div style={{ marginTop: 70 }}>
              <ProductFaq
                faqs={category.faqs}
                kicker="Buyer FAQ"
                title={`${category.name} - Questions & Answers`}
                intro="Answers to the questions we receive most about this product line. For anything else, send us a message."
              />
            </div>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div>
            <p className="kicker">Get a Quote</p>
            <h2 className="h-lg">Need {category.name.toLowerCase()} for Your Venue?</h2>
            <p>
              Tell us your quantity and destination port - our export team will
              confirm pricing, MOQ and delivery time in the quotation.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link href="/contact/" className="btn btn--accent">
              Request a Quote
            </Link>
            <a
              className="btn btn--ghost"
              href={`https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(
                `Hello VEETOP, I'm interested in ${category.name}. Please send me pricing.`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
