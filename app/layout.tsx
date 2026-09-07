import type { Metadata, Viewport } from "next";
import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";
import Header from "@/components/header";
import Footer from "@/components/footer";
import WhatsAppFloat from "@/components/whatsapp-float";
import JsonLd from "@/components/json-ld";
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
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1b2b",
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
  foundingDate: site.companyFacts.foundingDate,
  numberOfEmployees: site.companyFacts.employees,
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
        <WhatsAppFloat />
      </body>
    </html>
  );
}
