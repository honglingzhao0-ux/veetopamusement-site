import type { Metadata } from "next";
import site from "@/site.config";
import InquiryForm from "@/components/inquiry-form";

export const metadata: Metadata = {
  title: "Contact Us - Request a Quote",
  description:
    "Contact Guangzhou Veetop Amusement Technology Co., Ltd. for quotations, OEM/ODM projects and factory visits. Email Sales@veetopamusement.com or WhatsApp +86 188 2417 5545.",
  alternates: { canonical: "/contact/" },
};

const SOCIALS = [
  {
    name: "Facebook",
    href: site.socials.facebook,
    path: "M13.5 9H16V6h-2.5A3.5 3.5 0 0 0 10 9.5V11H8v3h2v7h3v-7h2.5l.5-3H13V9.5c0-.28.22-.5.5-.5z",
  },
  {
    name: "LinkedIn",
    href: site.socials.linkedin,
    path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34v-8.67H5.67v8.67h2.67zM7 8.47A1.55 1.55 0 1 0 7 5.37a1.55 1.55 0 0 0 0 3.1zm11.68 9.87v-4.72c0-2.53-1.35-3.71-3.16-3.71a2.72 2.72 0 0 0-2.46 1.36v-1.16h-2.67v8.67h2.67v-4.29c0-1.12.21-2.2 1.6-2.2 1.36 0 1.39 1.28 1.39 2.27v4.22h2.63z",
  },
];

export default function ContactPage() {
  const c = site.contact;
  const socials = SOCIALS.filter((s) => s.href);

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
              <ul className="info-list">
                <li className="info-row">
                  <svg
                    className="info-row__ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                  <div className="info-row__txt">
                    <span className="k">Email</span>
                    <a className="v" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  </div>
                </li>
                <li className="info-row">
                  <svg
                    className="info-row__ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div className="info-row__txt">
                    <span className="k">Phone</span>
                    <a className="v" href={`tel:${c.phone.tel}`}>
                      {c.phone.label}
                    </a>
                  </div>
                </li>
                <li className="info-row">
                  <svg
                    className="info-row__ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8.5z" />
                  </svg>
                  <div className="info-row__txt">
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
                </li>
                <li className="info-row">
                  <svg
                    className="info-row__ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div className="info-row__txt">
                    <span className="k">Address</span>
                    <span className="v">
                      {c.address.line1}
                      <br />
                      {c.address.line2}
                    </span>
                  </div>
                </li>
              </ul>
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
              {socials.filter((s) => s.href).length > 0 && (
                <div className="info-socials">
                  <span className="info-socials__label">Follow Us</span>
                  <div className="info-socials__row">
                    {socials
                      .filter((s) => s.href)
                      .map((s) => (
                        <a
                          key={s.name}
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`VEETOP on ${s.name}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d={s.path} />
                          </svg>
                        </a>
                      ))}
                  </div>
                </div>
              )}
              <p className="info-note">
                We reply to every inquiry - usually within one business day.
              </p>
            </div>
          </div>

          {/* form */}
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
