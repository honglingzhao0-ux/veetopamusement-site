import Link from "next/link";
import site from "@/site.config";
import { getCategories, getAllProducts } from "@/lib/products";
import ProductCard from "@/components/product-card";

export default function HomePage() {
  const categories = getCategories();
  const all = getAllProducts();
  // 每类取第一个产品作为"代表作"，凑成精选区
  const seen = new Set<string>();
  const featured = all.filter((p) => {
    if (seen.has(p.category)) return false;
    seen.add(p.category);
    return true;
  });

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="kicker">Game &amp; Amusement Equipment Manufacturer</p>
            <h1 className="hero__title">
              Factory-Direct{" "}
              <span className="accent-line">Arcade &amp; Amusement</span>{" "}
              Machines for Global Operators
            </h1>
            <p className="hero__sub">
              {site.brand.legalName} designs and builds arcade video games,
              redemption machines, claw cranes, kiddie rides, skill games and
              prize merchandisers - with OEM/ODM support, certified quality and
              worldwide shipping.
            </p>
            <div className="hero__actions">
              <Link href="/products/" className="btn btn--accent">
                Browse Products
              </Link>
              <Link href="/contact/" className="btn btn--ghost">
                Request a Quote
              </Link>
            </div>
            <ul className="hero__points">
              <li>OEM &amp; ODM support</li>
              <li>CE certified</li>
              <li>21+ years in the industry</li>
              <li>Export to 150+ countries</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Product Lines</p>
              <h2 className="h-xl">Six Core Categories</h2>
              <p>
                A full range of coin-operated equipment for arcades, FECs,
                malls and family venues.
              </p>
            </div>
            <Link href="/products/" className="btn btn--line">
              All Products
            </Link>
          </div>
          <ul className="cat-grid">
            {categories.map((cat) => {
              const count = all.filter((p) => p.category === cat.id).length;
              return (
                <li key={cat.id}>
                  <Link className="cat-card" href={`/products/${cat.slug}/`}>
                    <span className="cat-card__idx">0{cat.order}</span>
                    <h3 className="cat-card__name">{cat.name}</h3>
                    <p className="cat-card__blurb">{cat.tagline}</p>
                    <span className="cat-card__foot">
                      <span>
                        {count} model{count === 1 ? "" : "s"}
                      </span>
                      <span>Explore -&gt;</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- FEATURED ---------- */}
      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Featured Range</p>
              <h2 className="h-xl">Flagship Models</h2>
              <p>
                One representative model from every product line. Full catalog
                available under Products.
              </p>
            </div>
            <Link href="/products/" className="btn btn--line">
              View Catalog
            </Link>
          </div>
          <ul className="prod-grid">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- WHY US ---------- */}
      <section className="section">
        <div className="container split">
          <div>
            <p className="kicker">Why Veetop</p>
            <h2 className="h-xl">A Manufacturing Partner, Not Just a Supplier</h2>
            <p className="lede">
              Every machine is engineered for the punishment of daily public
              play - then backed by responsive after-sales parts support and
              factory-trained service guidance.
            </p>
            <ul className="list-check">
              <li>In-house R&amp;D, cabinet production and software team under one roof.</li>
              <li>Full OEM/ODM: custom cabinet size, artwork, game sets, languages, voltage &amp; plugs.</li>
              <li>Function and quality checks before shipment.</li>
              <li>Spare-parts inventory and factory-trained service guidance for operators worldwide.</li>
            </ul>
          </div>
          <div>
            <div className="why-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                {
                  n: "01",
                  t: "OEM / ODM",
                  d: "Private-label designs from concept to mass production.",
                },
                {
                  n: "02",
                  t: "Quality Control",
                  d: "Function and quality checks on every machine before shipment.",
                },
                {
                  n: "03",
                  t: "After-Sales",
                  d: "Warranty and after-sales support confirmed with every order.",
                },
                {
                  n: "04",
                  t: "Logistics",
                  d: "Sea, air or express; machines packed for safe transit.",
                },
              ].map((x) => (
                <div key={x.n} className="why-card">
                  <div className="why-card__num">{x.n}</div>
                  <h3>{x.t}</h3>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 20 }}>
              {site.companyFacts.certifications.map((c) => (
                <span className="chip" key={c} style={{ margin: "0 8px 8px 0" }}>
                  {c}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- OEM / ODM ---------- */}
      <section className="section section--tint" id="oem-odm">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">OEM / ODM</p>
              <h2 className="h-xl">Build Your Own Brand of Machines</h2>
              <p className="lede">
                From cabinet artwork to game software and control hardware, we
                turn your concept into production-ready, market-ready machines.
              </p>
            </div>
            <Link href="/about/#oem-odm" className="btn btn--accent">
              OEM / ODM Details
            </Link>
          </div>
          <ul className="steps">
            {[
              {
                n: "01",
                t: "Inquiry & Brief",
                d: "Share your idea, reference or existing product link.",
              },
              {
                n: "02",
                t: "Design & Sample",
                d: "CAD, artwork and prototype aligned before mass production.",
              },
              {
                n: "03",
                t: "Production",
                d: "In-line QC and full function testing before mass production.",
              },
              {
                n: "04",
                t: "Ship & Support",
                d: "Export documentation, spare parts and after-sales assistance.",
              },
            ].map((s) => (
              <li key={s.n} data-n={s.n}>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- GLOBAL REACH ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Global Reach</p>
              <h2 className="h-xl">Exporting to 150+ Countries</h2>
              <p>
                From our factory in Guangzhou, machines ship to operators
                worldwide - including Thailand, Brazil, the United States and
                Japan.
              </p>
            </div>
          </div>
          <div className="stats-grid" style={{ marginTop: 12 }}>
            <div className="stat-cell">
              <div className="stat-cell__num">{site.companyFacts.yearsInBusiness}</div>
              <div className="stat-cell__label">Years in Industry</div>
            </div>
            <div className="stat-cell">
              <div className="stat-cell__num">{site.companyFacts.exportCountries}</div>
              <div className="stat-cell__label">Countries Exported</div>
            </div>
            <div className="stat-cell">
              <div className="stat-cell__num">{site.companyFacts.marketShare}</div>
              <div className="stat-cell__label">Market Share</div>
            </div>
            <div className="stat-cell">
              <div className="stat-cell__num">{site.companyFacts.certifications.join("")}</div>
              <div className="stat-cell__label">Certification</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="cta-band">
        <div className="container">
          <div>
            <p className="kicker">Get a Quote</p>
            <h2 className="h-lg">Ready to Source for Your Venue?</h2>
            <p>
              Send your target models and quantity - our export team will
              confirm price, MOQ and delivery time in the quotation.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link href="/contact/" className="btn btn--accent">
              Request a Quote
            </Link>
            <a
              className="btn btn--ghost"
              href={`https://wa.me/${site.contact.whatsapp.number}`}
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
