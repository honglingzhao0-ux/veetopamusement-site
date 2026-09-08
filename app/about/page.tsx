import type { Metadata } from "next";
import Link from "next/link";
import site from "@/site.config";

export const metadata: Metadata = {
  title: "About Us - Factory, OEM/ODM & Certifications",
  description:
    "About Guangzhou Veetop Amusement Technology Co., Ltd.: a CE-certified manufacturer of arcade game machines and amusement equipment, 21+ years in the industry, exports to 150+ countries, OEM/ODM cooperation available.",
  alternates: { canonical: "/about/" },
};

const certDescriptions: Record<string, string> = {
  CE: "VEETOP is certified by CE. Certificate and compliance documents for specific models and markets are available on request.",
};

export default function AboutPage() {
  const c = site.contact;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">About Us</p>
          <h1>Your Manufacturing Partner for Game &amp; Amusement Equipment</h1>
          <p className="lede lede--light">
            {site.brand.legalName} is an amusement equipment manufacturer
            based in Guangzhou, China - exporting arcade machines and family
            entertainment products worldwide.
          </p>
        </div>
      </section>

      {/* intro */}
      <section className="section">
        <div className="container split">
          <div>
            <p className="kicker">Who We Are</p>
            <h2 className="h-xl">From Cabinet to Circuit Board - Built In-House</h2>
            <p className="lede">
              We integrate R&amp;D, cabinet fabrication, electronics assembly
              and software development in one facility, which keeps quality
              consistent and makes custom projects fast.
            </p>
            <p>
              Our product lines cover arcade video games, redemption &amp;
              ticket games, claw cranes, kiddie rides, sports &amp; skill games
              and prize merchandisers - serving amusement park groups, FEC
              chains, distributors and mall operators.
            </p>
            <p style={{ marginBottom: 0 }}>
              VEETOP integrates R&amp;D, manufacturing and sales in one
              company, holds the registered brands &quot;VEETOP&quot; and
              &quot;VEETOP Amusement&quot;, and cooperates with world-class
              brands on OEM/ODM projects.
            </p>
          </div>
          <div>
            <div className="stats-grid" style={{ marginTop: 0 }}>
              <div className="stat-cell">
                <div className="stat-cell__num">
                  {site.companyFacts.yearsInBusiness}
                </div>
                <div className="stat-cell__label">Years in Industry</div>
              </div>
              <div className="stat-cell">
                <div className="stat-cell__num">{site.companyFacts.exportCountries}</div>
                <div className="stat-cell__label">Export Markets</div>
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
        </div>
      </section>

      {/* factory strength */}
      <section className="section section--tint anchor-target" id="factory">
        <div className="container split">
          <div>
            <p className="kicker">Factory Strength</p>
            <h2 className="h-xl">One Facility, Full Control</h2>
            <p className="lede">
              We focus on the amusement game product industry and keep
              developing new products and improving production capacity.
            </p>
            <ul className="cap-list">
              <li>
                <b>R&amp;D &amp; Software</b>
                <span>In-house engineers for hardware, game software and cabinet structure.</span>
              </li>
              <li>
                <b>Manufacturing</b>
                <span>Cabinet production, electronics assembly and machine finishing.</span>
              </li>
              <li>
                <b>Quality Control</b>
                <span>Function and quality checks on every unit before packing.</span>
              </li>
              <li>
                <b>Export &amp; Logistics</b>
                <span>Export packing and shipping documentation for worldwide delivery.</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="kicker">Capabilities</p>
            <h2 className="h-xl">What We Can Do for You</h2>
            <ul className="list-check">
              <li>Catalog models across six product lines</li>
              <li>OEM: rebrand existing models with your artwork &amp; logo</li>
              <li>ODM: custom cabinet design, features or new game concepts</li>
              <li>Localization: language, artwork and market requirements</li>
              <li>After-sales: technical support coordination after delivery</li>
            </ul>
            <p style={{ marginTop: 24 }}>
              <Link href="/contact/" className="btn btn--dark">
                Discuss Your Project
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* OEM / ODM */}
      <section className="section section--dark anchor-target" id="oem-odm">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker kicker--light">OEM / ODM</p>
              <h2 className="h-xl" style={{ color: "#fff" }}>
                Private-Label &amp; Custom Machines
              </h2>
              <p className="lede--light" style={{ color: "rgba(255,255,255,0.7)" }}>
                {site.companyFacts.oemOdmNote} Below is the typical process from
                first contact to container loading.
              </p>
            </div>
          </div>
          <ul className="steps">
            <li>
              <h3>01. Inquiry</h3>
              <p>Send reference photos, links or drawings; tell us quantity and target market.</p>
            </li>
            <li>
              <h3>02. Quotation</h3>
              <p>Receive pricing, MOQ, lead time and suggested spec adjustments.</p>
            </li>
            <li>
              <h3>03. Sample</h3>
              <p>Review and approve artwork or a prototype before mass production.</p>
            </li>
            <li>
              <h3>04. Production</h3>
              <p>Mass production with quality checks and inspection.</p>
            </li>
            <li>
              <h3>05. Shipment</h3>
              <p>Packing and delivery by sea, air or express as agreed.</p>
            </li>
            <li>
              <h3>06. After-Sales</h3>
              <p>Warranty and after-sales support per the order contract.</p>
            </li>
          </ul>
          <p style={{ marginTop: 30 }}>
            <Link href="/contact/" className="btn btn--accent">
              Start an OEM / ODM Project
            </Link>{" "}
            <a
              className="btn btn--ghost"
              href={`https://wa.me/${c.whatsapp.number}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp {c.whatsapp.label}
            </a>
          </p>
        </div>
      </section>

      {/* certifications */}
      <section className="section anchor-target" id="certifications">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Compliance</p>
              <h2 className="h-xl">Certifications &amp; Quality</h2>
              <p>
                VEETOP is certified by CE. Certificate and compliance
                documents for specific models and markets are available on
                request.
              </p>
            </div>
          </div>
          <div className="cert-grid">
            {site.companyFacts.certifications.map((cert) => (
              <div className="cert-card" key={cert}>
                <div className="cert-card__logo">{cert.split(" ")[0]}</div>
                <div>
                  <h3>{cert}</h3>
                  <p>{certDescriptions[cert] ?? "Certificate available for the relevant model."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* facility photos */}
      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Our Facility</p>
              <h2 className="h-xl">Inside the Factory</h2>
              <p>
                Production, assembly and export operations run from our own
                facility in Guangzhou, China.
              </p>
            </div>
          </div>
          <div className="media-grid">
            <figure>
              <img
                src="/company/company-campus.jpg"
                alt="VEETOP factory campus exterior in Guangzhou"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Factory Campus, Guangzhou</figcaption>
            </figure>
            <figure>
              <img
                src="/company/company-production.jpg"
                alt="Arcade machine assembly and warehouse areas inside the factory"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Production, Assembly &amp; Warehouse</figcaption>
            </figure>
            <figure>
              <img
                src="/company/company-office-1.jpg"
                alt="Office interior where the VEETOP team works"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Office &amp; Operations Team</figcaption>
            </figure>
            <figure>
              <img
                src="/company/company-office-2.jpg"
                alt="Open-plan office area with staff at desks"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Operations Office</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* showcase gallery */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Showcase</p>
              <h2 className="h-xl">Showroom, Exhibitions &amp; Installations</h2>
              <p>
                Selected displays from our showroom, trade exhibitions and
                amusement venues. Some photos combine several pictures of the
                same display.
              </p>
            </div>
          </div>
          <div className="media-grid media-grid--gallery">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <figure key={n}>
                <img
                  src={`/gallery/gallery-${n}.jpg`}
                  alt={`Gallery photo ${n} of VEETOP amusement machines on display`}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container">
          <div>
            <p className="kicker kicker--light">Get in Touch</p>
            <h2 className="h-lg" style={{ color: "#fff" }}>
              Ask Us Anything About Sourcing
            </h2>
            <p>
              Email {c.email}, call {c.phone.label} or use the contact form -
              we will get back to you with the details you need.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link href="/contact/" className="btn btn--accent">
              Contact Us
            </Link>
            <a href={`mailto:${c.email}`} className="btn btn--ghost">
              Email Sales
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
