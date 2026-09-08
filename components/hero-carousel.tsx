"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Slide {
  src: string;
  alt: string;
  kicker: string;
  title: string;
  copy: string;
  align: "left" | "right";
  cta?: { label: string; href: string };
  cta2?: { label: string; href: string };
}

const SLIDES: Slide[] = [
  {
    src: "/banners/hero-1.jpg",
    alt: "Rows of arcade and amusement machines glowing in a neon-lit showroom",
    kicker: "Game & Amusement Equipment Manufacturer",
    title: "Factory-Direct Arcade & Amusement Machines for Global Operators",
    copy: "Guangzhou Veetop Amusement Technology Co., Ltd. designs and builds arcade video games, redemption machines, claw cranes, kiddie rides, skill games and prize merchandisers - with OEM/ODM support, CE-certified quality and worldwide shipping.",
    cta: { label: "Browse Products", href: "/products/" },
    cta2: { label: "Request a Quote", href: "/contact/" },
    align: "left",
  },
  {
    src: "/banners/hero-2.jpg",
    alt: "Two players enjoying an immersive VR motion ride on a motorcycle simulator",
    kicker: "Immersive VR & Motion Experiences",
    title: "Motion Rides and Simulators That Draw the Crowd",
    copy: "Full-size racing simulators and immersive VR cabinets engineered for continuous public operation - CE certified and factory-direct from our Guangzhou plant.",
    cta: { label: "Explore Simulators", href: "/products/arcade-video-games/" },
    cta2: { label: "Get a Quote", href: "/contact/" },
    align: "right",
  },
  {
    src: "/banners/hero-3.jpg",
    alt: "A family entertainment center floor with VEETOP machines and staff support on site",
    kicker: "Factory Direct, Worldwide",
    title: "One Factory. 150+ Countries Served.",
    copy: "21+ years building coin-operated amusement equipment, exported to 150+ countries with OEM/ODM, spare-parts inventory and responsive after-sales service.",
    cta: { label: "Start Your Inquiry", href: "/contact/" },
    align: "right",
  },
];

const AUTOPLAY_MS = 5500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      if (!pausedRef.current) {
        setIndex((p) => (p + 1) % SLIDES.length);
      }
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="hero hero--carousel"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
    >
      <div
        className="hero-carousel"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        {SLIDES.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.src}
              className={
                "hero-slide" +
                (active ? " is-active" : "") +
                (s.align === "right" ? " hero-slide--right" : "")
              }
              aria-hidden={!active}
            >
              <img
                src={s.src}
                alt={s.alt}
                className="hero-slide__img"
                loading="eager"
                decoding="async"
              />
              <div className="container">
                <div className="hero-slide__copy">
                  <p className="kicker">{s.kicker}</p>
                  {i === 0 ? (
                    <h1 className="hero-slide__title">{s.title}</h1>
                  ) : (
                    <p className="hero-slide__title">{s.title}</p>
                  )}
                  <p className="hero-slide__desc">{s.copy}</p>
                  {(s.cta || s.cta2) && (
                    <div className="hero-slide__actions">
                      {s.cta && (
                        <Link className="btn btn--accent" href={s.cta.href}>
                          {s.cta.label}
                        </Link>
                      )}
                      {s.cta2 && (
                        <Link className="btn btn--light" href={s.cta2.href}>
                          {s.cta2.label}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="hero-carousel__dots" role="tablist" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={"dot" + (i === index ? " is-active" : "")}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === index}
              role="tab"
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
