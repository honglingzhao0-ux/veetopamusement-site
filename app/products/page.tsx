import type { Metadata } from "next";
import Link from "next/link";
import site from "@/site.config";
import { getCategories, getAllProducts } from "@/lib/products";
import ProductExplorer from "@/components/product-explorer";

export const metadata: Metadata = {
  title: "Arcade & Amusement Machines Catalog - 210 Models",
  description:
    "210 arcade machines from Guangzhou Veetop: simulators, redemption and claw crane machines, kiddie rides, sports and prize games. CE certified, OEM/ODM.",
  alternates: { canonical: "/products/" },
};

export default function ProductsPage() {
  const categories = getCategories();
  const products = getAllProducts();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker kicker--light">Product Catalog</p>
          <h1>Arcade &amp; Amusement Equipment for Commercial Venues</h1>
          <p className="lede lede--light">
            {products.length} models across {categories.length} product lines.
            Browse by category below or filter this full catalog - every model
            is factory direct with OEM/ODM support.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cat-jump" aria-label="Browse by category">
            <span className="cat-jump__label">Browse by category:</span>
            {categories.map((cat, i) => (
              <span key={cat.id}>
                {i > 0 && <span className="cat-jump__sep">/</span>}
                <Link href={`/products/${cat.slug}/`}>{cat.name}</Link>
              </span>
            ))}
          </div>

          <ProductExplorer categories={categories} products={products} />

          <p style={{ marginTop: 26, fontSize: "0.88rem", color: "var(--muted)" }}>
            Net sizes and power ratings follow our official catalogue; standard
            production lead time is {site.trade.leadTime} for all models. Unit
            pricing and MOQ are confirmed by quotation. Contact{" "}
            {site.contact.email} for details.
          </p>
        </div>
      </section>
    </>
  );
}
