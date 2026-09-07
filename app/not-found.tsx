import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container nf">
      <div className="nf__code">
        4<em>0</em>4
      </div>
      <p className="lede" style={{ marginInline: "auto" }}>
        Page not found. The product may have been removed or the address is
        wrong.
      </p>
      <p style={{ marginTop: 26 }}>
        <Link href="/products/" className="btn btn--dark">
          Browse Products
        </Link>{" "}
        <Link href="/contact/" className="btn btn--line">
          Contact Us
        </Link>
      </p>
    </div>
  );
}
