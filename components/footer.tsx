import Link from "next/link";
import site from "@/site.config";
import { getCategories } from "@/lib/products";
import Logo from "@/components/logo";

/**
 * 社媒入口。href 取 site.config socials 字段；URL 为空时该平台不渲染，
 * 避免出现假链接。上线前在 site.config.ts 的 socials.facebook /
 * socials.linkedin 填入主页地址即可自动出现圆形图标。
 */
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

export default function Footer() {
  const categories = getCategories();
  const c = site.contact;
  const socials = SOCIALS.filter((s) => s.href);

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
            {socials.length > 0 && (
              <div className="footer-social">
                {socials.map((s) => (
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
            )}
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
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom__inner">
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
