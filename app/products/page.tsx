import type { Metadata } from "next";
import Link from "next/link";
import site from "@/site.config";
import { getCategories, getAllProducts } from "@/lib/products";
import ProductExplorer from "@/components/product-explorer";

export const metadata: Metadata = {
  title: "All Products - Arcade, Crane, Kiddie Rides & Redemption Machines",
  description:
    "Full product catalog of VEETOP amusement equipment: arcade video games, redemption & ticket games, claw cranes, kiddie rides, sports & skill games and prize merchandisers. Factory-direct, CE & RoHS, OEM/ODM, MOQ 1 unit.",
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
            All products shown are{" "}
            <strong>
              sample placeholder entries (marked &quot;Sample&quot;)
            </strong>{" "}
            with specifications subject to change. {site.contact.email} - we
            will confirm real specs, certifications and lead time in your
            quotation.
          </p>
        </div>
      </section>
    </>
  );
}
