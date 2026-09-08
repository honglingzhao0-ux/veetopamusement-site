import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/site.config";
import { siteBaseUrl, cdnUrl } from "@/lib/cdn";
import ProductGallery from "@/components/product-gallery";
import {
  getAllProductSlugs,
  getCategorySlugs,
  getProductBySlug,
  getCategoryBySlug,
  getCategoryById,
  getProductsByCategory,
  type Product,
} from "@/lib/products";
import JsonLd from "@/components/json-ld";
import ProductCard from "@/components/product-card";
import CategoryLanding from "@/components/category-landing";

const baseUrl = siteBaseUrl(site.brand.domain);

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 统一动态路由：
 *  - slug 命中产品 -> 产品详情页（图廊/规格/特性/相关产品/可选视频与 PDF）
 *  - slug 命中品类 -> 品类独立关键词着陆页（P0-1，见 components/category-landing.tsx）
 * 注：Next.js 不允许同一目录下并存两个动态段，故品类页与产品页共用 [slug]，
 *    URL 形态与要求一致（/products/<category-slug>/ 与 /products/<product-slug>/）。
 */
export function generateStaticParams() {
  return [...getAllProductSlugs(), ...getCategorySlugs()].map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = getProductBySlug(slug);
  if (product) {
    const cover = product.images[0] ? cdnUrl(product.images[0]) : undefined;
    const desc =
      product.seoDescription?.trim().slice(0, 160) ??
      product.description.slice(0, 158);
    return {
      title: `${product.name} (${product.model})`,
      description: desc,
      alternates: { canonical: `/products/${product.slug}/` },
      openGraph: {
        type: "website",
        title: `${product.name} (${product.model})`,
        description: desc,
        images: cover ? [{ url: cover, alt: product.name }] : undefined,
      },
    };
  }

  const category = getCategoryBySlug(slug);
  if (category) {
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

  return { title: "Page not found" };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const product = getProductBySlug(slug);
  if (product) return <ProductView product={product} />;

  const category = getCategoryBySlug(slug);
  if (category) {
    return (
      <CategoryLanding
        category={category}
        products={getProductsByCategory(category.id)}
      />
    );
  }

  notFound();
}

/* ==================================================================== */
/* 产品详情视图                                                         */
/* ==================================================================== */

function ProductView({ product }: { product: Product }) {
  const category = getCategoryById(product.category);
  const related = getProductsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  const waText = encodeURIComponent(
    `Hello VEETOP, I am interested in ${product.name} (${product.model}). Please send price for QTY __ to port __.`,
  );
  const quoteHref = `/contact/?product=${encodeURIComponent(
    `${product.model} - ${product.name}`,
  )}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} (${product.model})`,
    description:
      product.seoDescription?.trim() ?? product.description,
    image: product.images.map((i) => cdnUrl(i)),
    brand: { "@type": "Brand", name: site.brand.name },
    mpn: product.model,
    sku: product.model,
    category: category?.name ?? product.category,
    manufacturer: {
      "@type": "Organization",
      name: site.brand.legalName,
      url: baseUrl,
    },
  };

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
        name: product.name,
        item: `${baseUrl}/products/${product.slug}/`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="section">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/products/">Products</Link>
            <span className="sep">/</span>
            <Link href={`/products/${category?.slug ?? ""}/`}>
              {category?.name ?? "Catalog"}
            </Link>
            <span className="sep">/</span>
            <span>{product.name}</span>
          </nav>

          <div className="pd-layout">
            {/* gallery */}
            <div>
              <ProductGallery
                images={product.images.map((i) => cdnUrl(i))}
                alt={`${product.name} commercial ${product.category} machine for sale`}
              />
              {product.youtubeId ? (
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${product.youtubeId}`}
                    title={`${product.name} (${product.model}) demo video`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>

            {/* info */}
            <div className="pinfo">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="chip chip--accent">{product.model}</span>
                {product.certifications.map((cert) => (
                  <span className="chip" key={cert}>
                    {cert} Certified
                  </span>
                ))}
              </div>
              <h1 className="pinfo__title">{product.name}</h1>
              <p className="pinfo__head">{product.headline}</p>
              <p className="pinfo__desc">{product.description}</p>

              <div className="pinfo-actions">
                <Link href={quoteHref} className="btn btn--accent">
                  Request a Quote
                </Link>
                <a
                  className="btn whatsapp-btn"
                  href={`https://wa.me/${site.contact.whatsapp.number}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Inquiry
                </a>
              </div>
              {product.catalogPdf ? (
                <a
                  className="btn btn--line"
                  style={{ width: "100%", marginTop: 10 }}
                  href={cdnUrl(product.catalogPdf)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download Catalog (PDF)
                </a>
              ) : null}
              <Link
                href={`mailto:${site.contact.email}?subject=${encodeURIComponent(
                  `Inquiry: ${product.model} ${product.name}`,
                )}`}
                style={{ fontSize: "0.9rem", color: "var(--muted)" }}
              >
                or email {site.contact.email} directly
              </Link>

              <dl className="trade-card">
                <div className="trade-row">
                  <dt>Model</dt>
                  <dd>{product.model}</dd>
                </div>
                <div className="trade-row">
                  <dt>Certifications</dt>
                  <dd className="ok-dot">{product.certifications.join(" / ")}</dd>
                </div>
                <div className="trade-row">
                  <dt>Unit Price</dt>
                  <dd>On request - quotation basis</dd>
                </div>
                <div className="trade-row">
                  <dt>MOQ / Lead Time</dt>
                  <dd>Confirmed in the quotation</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* technical section */}
          <div
            className="split"
            style={{
              marginTop: 64,
              alignItems: "start",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <div>
              <p className="kicker">Specifications</p>
              <h2 className="h-lg">Technical Data</h2>
              <table className="spec-table" style={{ marginTop: 18 }}>
                <tbody>
                  {product.specs.map((s) => (
                    <tr key={s.label}>
                      <th scope="row">{s.label}</th>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="kicker" style={{ marginTop: 40 }}>
                Key Features
              </p>
              <h2 className="h-lg">Why Operators Choose It</h2>
              <ul className="list-check">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="kicker">Suitable Venues</p>
              <h2 className="h-lg">Best Applications</h2>
              <p style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
                {product.applications.map((a) => (
                  <span className="chip" key={a}>
                    {a}
                  </span>
                ))}
              </p>

              <div
                style={{
                  marginTop: 44,
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  background: "var(--surface)",
                  padding: "24px",
                }}
              >
                <p className="kicker">Customization</p>
                <h3 className="h-md">OEM / ODM Available</h3>
                <ul className="list-check">
                  <li>Custom cabinet artwork, brand &amp; color scheme</li>
                  <li>Localized software, languages and game sets</li>
                  <li>Voltage &amp; plug adaptation for target markets</li>
                  <li>Private-label packaging &amp; documentation</li>
                </ul>
                <Link
                  href="/about/#oem-odm"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                >
                  Learn about our OEM/ODM process -&gt;
                </Link>
              </div>
            </div>
          </div>

          {/* related */}
          {related.length > 0 && (
            <div style={{ marginTop: 70 }}>
              <div className="section-head">
                <div>
                  <p className="kicker">More in this line</p>
                  <h2 className="h-lg">Related Products</h2>
                </div>
                <Link
                  href={`/products/${category?.slug ?? ""}/`}
                  className="btn btn--line"
                >
                  View Full Category
                </Link>
              </div>
              <ul className="prod-grid">
                {related.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
