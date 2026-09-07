import type { Metadata } from "next";
import Link from "next/link";
import site from "@/site.config";

export const metadata: Metadata = {
  title: "About Us - Factory, OEM/ODM & Certifications",
  description:
    "About VEETOP Amusement: our factory, quality system, OEM/ODM capabilities and certifications (ISO 9001, CE, UL, RoHS). A B2B manufacturing partner for arcade and amusement equipment.",
  alternates: { canonical: "/about/" },
};

const certDescriptions: Record<string, string> = {
  "ISO 9001": "Factory quality management system covering production and QC.",
  CE: "Machine safety & EMC compliance for the European market.",
  UL: "Product safety certification for North American operation.",
  RoHS: "Restriction of hazardous substances in electrical parts.",
  SAA: "Australian/New Zealand electrical safety approval.",
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
              <span className="badge-sample">Note</span>{" "}
              <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Company intro, year and area on this page are placeholder
                samples - replace with verified facts before launch.
              </span>
            </p>
          </div>
          <div>
            <div className="stats-grid" style={{ marginTop: 0 }}>
              <div className="stat-cell">
                <div className="stat-cell__num">
                  {site.companyFacts.yearFounded}
                  <small> EST</small>
                </div>
                <div className="stat-cell__label">Founded</div>
              </div>
              <div className="stat-cell">
                <div className="stat-cell__num">{site.companyFacts.factoryArea}</div>
                <div className="stat-cell__label">Factory Area</div>
              </div>
              <div className="stat-cell">
                <div className="stat-cell__num">{site.companyFacts.exportCountries}</div>
                <div className="stat-cell__label">Export Markets</div>
              </div>
              <div className="stat-cell">
                <div className="stat-cell__num">
                  {site.companyFacts.warrantyMonths}
                  <small> mo</small>
                </div>
                <div className="stat-cell__label">Warranty</div>
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
              Sample placeholder copy - replace with your real production
              capabilities, photos and equipment lists.
            </p>
            <ul className="cap-list">
              <li>
                <b>R&amp;D &amp; Software</b>
                <span>In-house engineers for hardware, game software and cabinet structure.</span>
              </li>
              <li>
                <b>Cabinet Production</b>
                <span>CNC cutting, spraying, screen printing and assembly lines.</span>
              </li>
              <li>
                <b>Electronics &amp; Wiring</b>
                <span>Standardized harnesses and power systems with EMC-friendly layout.</span>
              </li>
              <li>
                <b>QC &amp; Aging Test</b>
                <span>Every unit runs function and 24-72h aging tests before packing.</span>
              </li>
              <li>
                <b>Export &amp; Logistics</b>
                <span>Experienced packing for sea freight; documents for customs clearance.</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="kicker">Capabilities</p>
            <h2 className="h-xl">What We Can Do for You</h2>
            <ul className="list-check">
              <li>Standard catalog products with short lead time</li>
              <li>OEM: rebrand existing models with your artwork &amp; logo</li>
              <li>ODM: new cabinet sizes, features or game concepts</li>
              <li>Localization: language, voltage, plug and coin systems</li>
              <li>Mixed-container loading across product lines</li>
              <li>Spare parts supply and technical video support</li>
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
              <p>Approve artwork/prototype; sample units available before mass order.</p>
            </li>
            <li>
              <h3>04. Production</h3>
              <p>Deposit, mass production, in-line QC, aging tests and inspection.</p>
            </li>
            <li>
              <h3>05. Shipment</h3>
              <p>Balance payment, packing and delivery by sea/air/express.</p>
            </li>
            <li>
              <h3>06. After-Sales</h3>
              <p>Warranty support, parts dispatch and remote troubleshooting.</p>
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
                Sample certificate list - confirm the actual certificates for
                each model with our sales team, as requirements vary by market.
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
              we usually reply within 24 business hours.
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
