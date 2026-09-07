import Link from "next/link";
import site from "@/site.config";
import { getCategories } from "@/lib/products";
import Logo from "@/components/logo";

export default function Footer() {
  const categories = getCategories();
  const c = site.contact;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="VEETOP Amusement - Home">
              <Logo light />
            </Link>
            <p>
              Game &amp; amusement equipment manufacturer supplying arcades,
              FECs and distributors worldwide with factory-direct pricing and
              OEM/ODM support.
            </p>
          </div>

          <nav aria-label="Products">
            <h4>Products</h4>
            <ul>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products/${cat.slug}/`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about/">About Us</Link>
              </li>
              <li>
                <Link href="/about/#factory">Factory Strength</Link>
              </li>
              <li>
                <Link href="/about/#oem-odm">OEM / ODM</Link>
              </li>
              <li>
                <Link href="/about/#certifications">Certifications</Link>
              </li>
              <li>
                <Link href="/faq/">FAQ - Trade Terms</Link>
              </li>
              <li>
                <Link href="/contact/">Contact &amp; Inquiry</Link>
              </li>
            </ul>
          </nav>

          <div>
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li>
                <span className="k">Email</span>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </li>
              <li>
                <span className="k">Tel</span>
                <a href={`tel:${c.phone.tel}`}>{c.phone.label}</a>
              </li>
              <li>
                <span className="k">WA</span>
                <a
                  href={`https://wa.me/${c.whatsapp.number}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.whatsapp.label}
                </a>
              </li>
              <li>
                <span className="k">Addr</span>
                <span>
                  {c.address.line1}
                  <br />
                  {c.address.line2}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} {site.brand.legalName}. All
            rights reserved.
          </span>
          <span>B2B game &amp; amusement equipment manufacturer.</span>
        </div>
      </div>
    </footer>
  );
}
