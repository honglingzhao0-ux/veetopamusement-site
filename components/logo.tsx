import site from "@/site.config";

/**
 * 品牌 Logo：几何 V 字方块 + 字标。
 * 只负责视觉，不带链接（由 Header/Footer 决定放在哪里）。
 */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="logo">
      <span className="logo__mark" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4h6.4L20 20h-6.4L4 4Z"
            fill="#ff6a00"
            opacity="0.95"
          />
          <path d="M11 4h3L24 20h-3L11 4Z" fill="#fff" opacity="0.92" />
        </svg>
      </span>
      <span className="logo__text">
        <span
          className="logo__name"
          style={light ? { color: "#fff" } : undefined}
        >
          {site.brand.name}
        </span>
        <span className="logo__sub">{site.brand.suffix}</span>
      </span>
    </span>
  );
}
