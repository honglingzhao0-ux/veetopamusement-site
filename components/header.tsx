"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import site from "@/site.config";
import Logo from "@/components/logo";

const NAV = [
  { label: "Products", href: "/products/" },
  { label: "About", href: "/about/" },
  { label: "OEM & ODM", href: "/about/#oem-odm" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    const path = href.split("#")[0];
    return pathname === path;
  };

  const c = site.contact;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" aria-label="VEETOP Amusement - Home">
          <Logo />
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={"site-nav__link" + (isActive(l.href) ? " is-active" : "")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-cta">
          <a className="hdr-tel" href={`tel:${c.phone.tel}`}>
            {c.phone.label}
          </a>
          <Link href="/contact/" className="btn btn--accent btn--sm">
            Get a Quote
          </Link>
        </div>

        <button
          type="button"
          className="burger"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {open ? (
              <path
                d="M4 4l12 12M16 4L4 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2 5h16M2 10h16M2 15h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      <div className={"mobile-nav" + (open ? " is-open" : "")}>
        {NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="mobile-nav__link"
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        <a
          href={`https://wa.me/${c.whatsapp.number}`}
          target="_blank"
          rel="noreferrer"
          className="mobile-nav__link"
          onClick={() => setOpen(false)}
        >
          WhatsApp: {c.whatsapp.label}
        </a>
        <Link
          href="/contact/"
          className="btn btn--accent btn--block"
          style={{ marginTop: 16 }}
          onClick={() => setOpen(false)}
        >
          Get a Quote
        </Link>
      </div>
    </header>
  );
}
