import type { CSSProperties } from "react";
import Link from "next/link";
import site from "@/site.config";
import { getCategories, getAllProducts, getCategoryById } from "@/lib/products";
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
            <p className="kicker kicker--light">Game &amp; Amusement Equipment Manufacturer</p>
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

          <div className="hero__art" aria-hidden="true">
            <div className="stage">
              <div className="stage__tag">
                <span>Product Blueprint</span>
              </div>
              <div className="stage__fig">
                <svg viewBox="0 0 300 400" fill="none">
                  {/* cabinet */}
                  <path
                    d="M74 384V168C74 92 128 62 150 62c22 0 76 30 76 106v216"
                    stroke="#ffffff"
                    strokeOpacity="0.85"
                    strokeWidth="3"
                  />
                  {/* marquee */}
                  <path
                    d="M98 120c0-22 20-34 52-34s52 12 52 34"
                    stroke="#f4511e"
                    strokeWidth="3"
                  />
                  {/* screen */}
                  <rect x="96" y="138" width="108" height="104" rx="6" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
                  <rect x="104" y="146" width="92" height="88" rx="4" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
                  {/* screen glow */}
                  <rect x="106" y="148" width="40" height="40" fill="#f4511e" opacity="0.55" />
                  {/* control deck */}
                  <path d="M88 268h124" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" />
                  {/* joystick */}
                  <circle cx="132" cy="292" r="9" stroke="#fff" strokeWidth="2.5" />
                  <path d="M132 283v-16m0 0-8-10m8 10 8-10" stroke="#f4511e" strokeWidth="2.5" strokeLinecap="round" />
                  {/* buttons */}
                  <circle cx="176" cy="288" r="7" stroke="#fff" strokeWidth="2.5" />
                  <circle cx="198" cy="288" r="7" stroke="#fff" strokeWidth="2.5" />
                  <circle cx="220" cy="288" r="7" stroke="#fff" strokeWidth="2.5" />
                  {/* coin slot */}
                  <circle cx="150" cy="330" r="8" stroke="#fff" strokeWidth="2.5" />
                  <rect x="120" y="318" width="60" height="24" rx="4" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" />
                  {/* base */}
                  <path d="M74 384h152" stroke="#f4511e" strokeWidth="3" />
                  {/* dimension line */}
                  <path d="M20 60v310M20 60l-7 12m7-12 7 12" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" />
                  <text x="20" y="44" textAnchor="middle" fill="#fff" fillOpacity="0.45" fontSize="11" fontFamily="Consolas, monospace">H 2150</text>
                  <path d="M30 392h240M30 392l-7-12m7 12 7-12" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" />
                  <text x="150" y="376" textAnchor="middle" fill="#fff" fillOpacity="0.45" fontSize="11" fontFamily="Consolas, monospace">W 800 mm</text>
                </svg>
              </div>
            </div>
          </div>

          <div className="hero__stats">
            <div className="hero-stat">
              <div className="hero-stat__num">
                {site.companyFacts.yearsInBusiness}
              </div>
              <div className="hero-stat__label">Years in Industry</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat__num">{site.companyFacts.exportCountries}</div>
              <div className="hero-stat__label">Countries Exported</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat__num">{site.companyFacts.marketShare}</div>
              <div className="hero-stat__label">Market Share</div>
            </div>
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
            {categories.map((cat, i) => {
              const count = all.filter((p) => p.category === cat.id).length;
              return (
                <li key={cat.id}>
                  <Link
                    className="cat-card"
                    href={`/products/${cat.slug}/`}
                    style={
                      {
                        "--card-accent": `hsl(${(i * 47 + 12) % 360} 70% 52%)`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="cat-card__idx">0{i + 1}</span>
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
              <li>Spare-parts inventory &amp; video-guide support for operators worldwide.</li>
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
                  d: "ISO-guided process with burn-in and function testing.",
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

      {/* ---------- OEM CTA BAND ---------- */}
      <section className="section section--dark" id="oem-odm">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker kicker--light">OEM / ODM</p>
              <h2 className="h-xl" style={{ color: "#fff" }}>
                Build Your Own Brand of Machines
              </h2>
              <p className="lede--light" style={{ color: "rgba(255,255,255,0.7)" }}>
                From cabinet artwork to game software and control hardware, we
                turn your concept into production-ready, market-ready machines.
              </p>
            </div>
            <Link href="/about/#oem-odm" className="btn btn--accent">
              OEM / ODM Details
            </Link>
          </div>
          <ul className="steps">
            <li>
              <h3>Inquiry &amp; Brief</h3>
              <p>Share your idea, reference or existing product link.</p>
            </li>
            <li>
              <h3>Design &amp; Sample</h3>
              <p>CAD, artwork and prototype aligned before mass production.</p>
            </li>
            <li>
              <h3>Production</h3>
              <p>Certified components, in-line QC and full aging tests.</p>
            </li>
            <li>
              <h3>Ship &amp; Support</h3>
              <p>Documentation, parts kit and after-sales assistance.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="cta-band">
        <div className="container">
          <div>
            <p className="kicker kicker--light">Get a Quote</p>
            <h2 className="h-lg" style={{ color: "#fff" }}>
              Ready to Source for Your Venue?
            </h2>
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
