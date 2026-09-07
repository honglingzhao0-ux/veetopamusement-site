import type { Metadata } from "next";
import site from "@/site.config";
import InquiryForm from "@/components/inquiry-form";

export const metadata: Metadata = {
  title: "Contact Us - Request a Quote",
  description:
    "Contact VEETOP Amusement for quotations, OEM/ODM projects, samples and factory visits. Email, WhatsApp and phone are answered within 24 business hours.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  const c = site.contact;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">Contact</p>
          <h1>Talk to Our Export Team</h1>
          <p className="lede lede--light">
            Quotations, samples, OEM/ODM projects or factory visits - send your
            requirements and we will come back with a clear answer.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          {/* info */}
          <div>
            <div className="info-card">
              <div className="info-row">
                <span className="k">Email</span>
                <a className="v" href={`mailto:${c.email}`}>
                  {c.email}
                </a>
              </div>
              <div className="info-row">
                <span className="k">Phone</span>
                <a className="v" href={`tel:${c.phone.tel}`}>
                  {c.phone.label}
                </a>
              </div>
              <div className="info-row">
                <span className="k">WhatsApp</span>
                <a
                  className="v"
                  href={`https://wa.me/${c.whatsapp.number}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.whatsapp.label}
                </a>
              </div>
              <div className="info-row">
                <span className="k">Address</span>
                <span className="v">
                  {c.address.line1}
                  <br />
                  {c.address.line2}
                </span>
              </div>
              <div className="info-row">
                <span className="k">Working Hours</span>
                <span className="v">{c.hours}</span>
              </div>
              <div className="info-actions">
                <a href={`mailto:${c.email}`} className="btn btn--dark">
                  Email Sales
                </a>
                <a
                  href={`https://wa.me/${c.whatsapp.number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn whatsapp-btn"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="callout" style={{ marginTop: 18 }}>
              <strong>Note</strong>
              <span>
                All contact details on this page are placeholders. Replace them
                in <code>site.config.ts</code> (search &quot;REPLACE&quot;)
                before publishing.
              </span>
            </div>
          </div>

          {/* form */}
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
