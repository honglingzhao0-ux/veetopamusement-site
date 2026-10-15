"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import site from "@/site.config";
import Logo from "@/components/logo";
import type { NavCategoryNode } from "@/lib/nav-data";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about/" },
  { label: "OEM & ODM", href: "/about/#oem-odm" },
  { label: "News", href: "/news/" },
  { label: "Blog", href: "/blog/" },
  { label: "Contact", href: "/contact/" },
];

interface SiteHeaderProps {
  categories: NavCategoryNode[];
}

export default function SiteHeader({ categories }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileProdOpen, setMobileProdOpen] = useState(false);
  /*
   * 桌面 Products 下拉状态机：closed -> hover（鼠标进入自动展开）-> pinned（点击后锁定展开）。
   * 另用 ref 镜像当前值，避免快速点击与触屏合成事件读到上一帧 state。
   */
  const [ddMode, setDdMode] = useState<"closed" | "hover" | "pinned">("closed");
  const ddModeRef = useRef<"closed" | "hover" | "pinned">("closed");
  const ddRef = useRef<HTMLDivElement>(null);
  const ddOpen = ddMode !== "closed";
  const setDdModeSafe = (m: "closed" | "hover" | "pinned") => {
    ddModeRef.current = m;
    setDdMode(m);
  };

  const isActive = (href: string) => {
    const path = href.split("#")[0];
    return pathname === path;
  };

  const isProductsActive = pathname === "/products/" || pathname.startsWith("/products/");

  const closeDd = () => setDdModeSafe("closed");
  const closeAllMobile = () => {
    setOpen(false);
    setMobileProdOpen(false);
  };

  /* 外部点击 / Esc 关闭桌面下拉 */
  useEffect(() => {
    if (!ddOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) closeDd();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDd();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ddOpen]);

  const c = site.contact;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" aria-label="VEETOP Amusement - Home">
          <Logo />
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {NAV.filter((l) => l.label === "Home").map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={"site-nav__link" + (isActive(l.href) ? " is-active" : "")}
            >
              {l.label}
            </Link>
          ))}

          <div
            className={"nav-dd" + (ddOpen ? " is-open" : "")}
            ref={ddRef}
            onMouseEnter={() => {
              if (ddModeRef.current === "closed") setDdModeSafe("hover");
            }}
            onMouseLeave={() => {
              if (ddModeRef.current === "hover") setDdModeSafe("closed");
            }}
          >
            {/* "Products" 文字是真链接（进入 /products/）；箭头是独立按钮，
                只负责展开/收起，触屏与键盘用户因此仍可打开菜单。 */}
            <Link
              href="/products/"
              className={
                "site-nav__link nav-dd__link" +
                (isProductsActive ? " is-active" : "")
              }
              onClick={closeDd}
            >
              Products
            </Link>
            <button
              type="button"
              className="nav-dd__btn"
              aria-haspopup="true"
              aria-expanded={ddOpen}
              aria-controls="nav-dd-panel"
              aria-label="Toggle product categories"
              onClick={() =>
                setDdModeSafe(ddModeRef.current === "pinned" ? "closed" : "pinned")
              }
            >
              <svg
                className="nav-dd__caret"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1.5 3.5 5 7l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div
              className="nav-dd__panel"
              id="nav-dd-panel"
              role="menu"
              aria-label="Product categories"
            >
              <div className="nav-dd__grid">
                {categories.map((cat) => (
                  <div className="nav-dd__group" key={cat.slug}>
                    <Link
                      className="nav-dd__cat"
                      href={`/products/${cat.slug}/`}
                      onClick={closeDd}
                    >
                      {cat.name}
                    </Link>
                  </div>
                ))}
              </div>
              <Link
                className="nav-dd__all"
                href="/products/"
                onClick={closeDd}
              >
                View All Products &rarr;
              </Link>
            </div>
          </div>

          {NAV.filter((l) => l.label !== "Home").map((l) => (
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
            <svg
              className="hdr-tel__ico"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
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
        <div className="mobile-nav__item">
          <button
            type="button"
            className="mobile-nav__link"
            aria-expanded={mobileProdOpen}
            onClick={() => setMobileProdOpen((v) => !v)}
          >
            Products
            <svg
              className={"mobile-nav__caret" + (mobileProdOpen ? " is-open" : "")}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 4.5 6 8l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {mobileProdOpen && (
            <div className="mobile-nav__sub">
              <Link
                className="mobile-nav__subcat"
                href="/products/"
                onClick={closeAllMobile}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <div key={cat.slug}>
                  <Link
                    className="mobile-nav__subcat"
                    href={`/products/${cat.slug}/`}
                    onClick={closeAllMobile}
                  >
                    {cat.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="mobile-nav__link"
            onClick={closeAllMobile}
          >
            {l.label}
          </Link>
        ))}
        <a
          href={`https://wa.me/${c.whatsapp.number}`}
          target="_blank"
          rel="noreferrer"
          className="mobile-nav__link"
          onClick={closeAllMobile}
        >
          WhatsApp: {c.whatsapp.label}
        </a>
        <span className="mobile-nav__link">WeChat: {c.wechat.label}</span>
        <Link
          href="/contact/"
          className="btn btn--accent btn--block"
          style={{ marginTop: 16 }}
          onClick={closeAllMobile}
        >
          Get a Quote
        </Link>
      </div>
    </header>
  );
}
