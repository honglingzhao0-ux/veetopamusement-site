import type { Metadata, Viewport } from "next";
import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";
import Header from "@/components/header";
import Footer from "@/components/footer";
import JsonLd from "@/components/json-ld";
import Analytics from "@/components/analytics";
import "./globals.css";

const baseUrl = siteBaseUrl(site.brand.domain);

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: site.seo.title,
    template: `%s | ${site.brand.name} ${site.brand.suffix}`,
  },
  description: site.seo.description,
  keywords: site.seo.keywords,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: `${site.brand.name} ${site.brand.suffix}`,
    title: site.seo.title,
    description: site.seo.description,
    url: baseUrl,
    // 默认社交分享图（1200×630，由 scripts/make-og-image.py 生成）
    // 页面级 og:image 会在各页 metadata 里覆盖为产品图
    images: [
      {
        url: `${baseUrl}/og/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: `${site.brand.name} ${site.brand.suffix} — arcade and amusement equipment manufacturer`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: [`${baseUrl}/og/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/* Organization 实体（P0-5）：数字/社媒/geo 全部只读 site.config，无页面硬编码 */
const socials = Object.values(site.socials).filter((u) => u.trim() !== "");
const geo = site.contact.address.geo;
const lat = parseFloat(geo.latitude);
const lng = parseFloat(geo.longitude);
const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);

const orgJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.brand.legalName,
  alternateName: `${site.brand.name} ${site.brand.suffix}`,
  url: baseUrl,
  logo: `${baseUrl}/icon.svg`,
  email: site.contact.email,
  telephone: site.contact.phone.label,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.line1,
    addressLocality: site.contact.address.line2.split(",")[0].trim(),
    addressCountry: "CN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: site.contact.phone.label,
    contactType: "sales",
    email: site.contact.email,
    areaServed: "Worldwide",
    availableLanguage: ["English", "Chinese"],
  },
  description: site.seo.description,
};

if (socials.length) orgJsonLd.sameAs = socials;
if (hasGeo) {
  orgJsonLd.geo = {
    "@type": "GeoCoordinates",
    latitude: lat,
    longitude: lng,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={orgJsonLd} />
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
