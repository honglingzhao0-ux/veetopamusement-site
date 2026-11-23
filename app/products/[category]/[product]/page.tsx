import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/site.config";
import { siteBaseUrl, cdnUrl } from "@/lib/cdn";
import ProductGallery from "@/components/product-gallery";
import {
  getAllProducts,
  getProductBySlug,
  getCategoryById,
  getCategorySlugForProduct,
  getProductsByCategory,
  type Product,
} from "@/lib/products";
import { productPath } from "@/lib/product-url";
import JsonLd from "@/components/json-ld";
import ProductCard from "@/components/product-card";

const baseUrl = siteBaseUrl(site.brand.domain);

interface Props {
  params: Promise<{ category: string; product: string }>;
}

/**
 * 配对的品类段与产品段必须一致：品类段取产品自身 category 解析出的 slug，
 * 避免同一产品通过其他品类段被访问而生成重复 URL。
 */
function resolve(params: { category: string; product: string }): Product | undefined {
  const product = getProductBySlug(params.product);
  if (!product) return undefined;
  return getCategorySlugForProduct(product) === params.category ? product : undefined;
}

export function generateStaticParams() {
  return getAllProducts().map((p) => ({
    category: getCategorySlugForProduct(p),
    product: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, product: productSlug } = await params;
  const product = resolve({ category, product: productSlug });
  if (!product) return { title: "Page not found" };

  const cover = product.images[0] ? cdnUrl(product.images[0]) : undefined;

  /**
   * title 结构：产品名 + 型号 + Wholesale + 短品类
   *
   * ⚠️ 长度是硬约束（Google 桌面端约 60-70 字符完整显示，超出即截断）：
   *   实测 210 个产品的 title 平均 74 字符、131 个超 70 ——
   *   那样写进去的关键词根本显示不出来，等于白写。
   *   所以这里按长度预算**反推**商品名可占的字符数（shortenName），
   *   保证 210 个产品全部 ≤ 70。
   *
   * 用「Wholesale + 短品类」而非完整品类名：
   *   采购者搜的是 "<品类> wholesale supplier"（2026-11 调研），
   *   短品类既含关键词又省字符。
   *
   * ⚠️ 这里**不再写品牌名** —— 根布局的 metadata template 会自动追加
   *   " | VEETOP AMUSEMENT"，自己再写一遍会重复并挤掉关键词预算
   *   （实测加上后平均变成 86 字符，全部超限）。
   */
  const shortCat =
    ({
      "arcade-video-games": "Arcade Machine",
      "sports-skill-games": "Sports Game",
      "claw-crane-machines": "Claw Crane",
      "kiddie-rides": "Kiddie Ride",
      "prize-merchandisers": "Prize Game",
      "redemption-ticket-games": "Redemption Game",
    } as Record<string, string>)[product.category] ?? "Arcade Machine";

  const titleTail = ` - Wholesale ${shortCat}`;
  const modelPart = ` (${product.model})`;
  /**
   * 构造后校验 + 二次裁剪（确定性做法）。
   *
   * ⚠️ 之前用「预算公式 + Math.max(16, …) 下限」是错的：
   *   当公式算出 0（型号长 + 品类词长）时，下限 16 会强行撑破限制，
   *   导致 40 个产品 title 仍超 70（实测最长 73）。
   *   所以这里改成：先构造，再看超了多少，按超出量二次裁剪商品名。
   */
  const BRAND_TAIL_LEN = 19; // 根布局 template 追加的 " | VEETOP AMUSEMENT"
  let namePart = product.name;
  let title = `${namePart}${modelPart}${titleTail}`;
  if (title.length + BRAND_TAIL_LEN > 70) {
    const over = title.length + BRAND_TAIL_LEN - 70;
    namePart = shortenName(namePart, Math.max(1, namePart.length - over - 1));
    title = `${namePart}${modelPart}${titleTail}`;
  }

  /**
   * description 结构：产品名 + 型号 + 工厂直供 + 精简规格 + 贸易条款
   *
   * 关键点：
   *   ① 以产品名开头 —— 搜索结果里要能看出"这是什么机器"，否则点击率受损
   *   ② 把买家关心的 MOQ / FOB 价格写进摘要 —— 采购者能在结果页就完成初筛
   *   ③ 规格去重 —— 某些产品的 Size 在 specs 里出现两次
   *      （如 "W180 x D200 x H200 cm" 与 "W180*D200*H200"），不处理会吃掉字符预算
   *   ④ 严格 ≤ 160 字符（Google 摘要截断位）
   */
  const specMap: Record<string, string> = {};
  for (const s of product.specs) {
    const lab = s.label.trim();
    if (lab && !specMap[lab] && s.value.trim()) specMap[lab] = s.value.trim();
  }
  let sizeTxt = specMap["Size"] ?? "";
  if (sizeTxt) {
    const parts = sizeTxt
      .split(/[,;]/)
      .map((p) => p.trim())
      .filter(Boolean);
    const uniq: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase().replace(/[^0-9a-z]/g, "");
      if (key && !uniq.some((u) => u.toLowerCase().replace(/[^0-9a-z]/g, "") === key)) {
        uniq.push(p);
      }
    }
    sizeTxt = uniq.join(", ");
  }
  let specTxt = [sizeTxt, specMap["Power"]].filter(Boolean).join(" ");
  if (specTxt.length > 45) specTxt = `${specTxt.slice(0, 42).trimEnd()}...`;

  // 注意：generateMetadata 里的 category 是 URL slug（字符串），
  // 品类对象要从 product.category 反查
  const catFull = getCategoryById(product.category)?.name ?? "Arcade Machine";
  let desc =
    `${product.name} (${product.model}) - factory-direct ${catFull.toLowerCase()}` +
    (specTxt ? `. ${specTxt}` : "") +
    `. CE certified, OEM/ODM. MOQ & FOB price on request.`;
  // 严格 ≤ 160：在词边界截断，补句号后仍要 ≤160
  if (desc.length > 160) {
    desc = `${desc.slice(0, 159).replace(/\s+\S*$/, "").trimEnd()}.`;
    if (desc.length > 160) desc = desc.slice(0, 159).trimEnd() + ".";
  }

  return {
    title,
    description: desc,
    alternates: { canonical: productPath(category, product.slug) },
    openGraph: {
      type: "website",
      title,
      description: desc,
      images: cover ? [{ url: cover, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { category, product: productSlug } = await params;
  const product = resolve({ category, product: productSlug });
  if (!product) notFound();

  return <ProductView product={product} categorySlug={category} />;
}

/**
 * 按字符预算截断产品名。
 *
 * ⚠️ 返回值**严格 ≤ limit** —— 这一点很关键：
 *   早期版本在末尾追加 "..."，导致实际长度比 limit 多 3，
 *   于是 69/210 个产品的 title 超出 70 字符上限（实测最长 76）。
 *   所以这里的预算必须把省略号算进去，且截断后不再追加任何字符。
 */
function shortenName(name: string, limit: number): string {
  if (name.length <= limit) return name;
  // 留 3 个字符给省略号
  const hard = Math.max(1, limit - 3);
  let cut = name.slice(0, hard);
  // 在空格处断开，避免把单词切一半
  const sp = cut.lastIndexOf(" ");
  if (sp > hard * 0.5) cut = cut.slice(0, sp);
  cut = cut.replace(/[ ,/-]+$/, "");
  if (!cut) cut = name.slice(0, hard).replace(/[ ,/-]+$/, "");
  return `${cut}...`;
}

/* ==================================================================== */
/* 产品详情视图                                                         */
/* ==================================================================== */

function ProductView({
  product,
  categorySlug,
}: {
  product: Product;
  categorySlug: string;
}) {
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
    url: `${baseUrl}${productPath(categorySlug, product.slug)}`,
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
        name: category?.name ?? "Catalog",
        item: `${baseUrl}/products/${categorySlug}/`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${baseUrl}${productPath(categorySlug, product.slug)}`,
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
            <Link href={`/products/${categorySlug}/`}>
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
                  <dd>{site.trade.priceNote}</dd>
                </div>
                <div className="trade-row">
                  <dt>MOQ</dt>
                  <dd>Confirmed in the quotation</dd>
                </div>
                <div className="trade-row">
                  <dt>Lead Time</dt>
                  <dd>{site.trade.leadTime}</dd>
                </div>
              </dl>

              {/* 报价包含什么 —— 让买家判断"值不值得发询盘"时有依据，
                  而不是面对一个空白的价格栏。 */}
              <div className="quote-includes">
                <p className="kicker">What your quotation includes</p>
                <ul className="list-check">
                  {site.trade.quoteIncludes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="quote-includes__note">
                  Price varies by {site.trade.priceFactors.join(", ").toLowerCase()}.
                </p>
                <div className="quote-includes__actions">
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
              </div>
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
                  href={`/products/${categorySlug}/`}
                  className="btn btn--line"
                >
                  View Full Category
                </Link>
              </div>
              <ul className="prod-grid">
                {related.map((p) => (
                  <ProductCard
                    key={p.slug}
                    product={p}
                    categorySlug={categorySlug}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
