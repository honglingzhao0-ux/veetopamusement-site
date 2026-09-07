"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import site from "@/site.config";
import Logo from "@/components/logo";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) return pathname === href.split("#")[0];
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link href="/" aria-label="VEETOP Amusement - Home">
            <Logo />
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            {site.nav.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "site-nav__link" + (isActive(l.href) ? " is-active" : "")
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="header-cta">
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
          {site.nav.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mobile-nav__link"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact/"
            className="btn btn--accent btn--block"
            style={{ marginTop: 14 }}
            onClick={() => setOpen(false)}
          >
            Get a Quote
          </Link>
        </div>
      </header>
    </>
  );
}
