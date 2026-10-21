import site from "@/site.config";

/**
 * 品牌 Logo（官方版，可切换配色）
 *
 * 素材：
 *   public/brand/logo-full-dark.png         蓝版深字（浅色背景用）
 *   public/brand/logo-full-light.png        蓝版反白（深色背景用）
 *   public/brand/logo-full-dark-orange.png  标准橙深字
 *   public/brand/logo-full-light-orange.png 标准橙反白
 *   public/brand/logo-full-dark-flame.png   火焰橙深字
 *   public/brand/logo-full-light-flame.png  火焰橙反白
 *   public/brand/logo-mark.png              仅 V 形标（蓝）
 *   public/brand/logo-mark-orange.png       仅 V 形标（标准橙）
 *   public/brand/logo-mark-flame.png        仅 V 形标（火焰橙）
 *
 * 官方 Logo 构成：渐变 V 形标 + 衬线体 VEETOP 字标。
 * 蓝色版品牌色：深蓝 #002665 / 亮蓝 #0071BD / 浅蓝 #34A2DD
 * 橙色版由 scripts/make-logo-orange.py 从蓝版换色生成，
 * 保留原有渐变层次：
 *   标准橙  主色 #f15700（≈ 站点 accent #ff6a00）
 *   火焰橙  主色 #e52f00（更偏红更饱和，接近 OrangeRed #ff4500）
 *
 * 为什么用 PNG 而非 SVG：
 *   官方 Logo 是设计稿导出的位图，手绘 SVG 路径容易走样；
 *   PNG 在 header 尺寸（高约 34px）下完全够清晰，体积也可接受。
 *
 * LOGO_VARIANT 改这一个常量即可切换配色
 * （"blue" | "orange" | "flame"）。
 * light=true 时用反白版（深色页脚 / 深色背景）。
 */
const LOGO_VARIANT: "blue" | "orange" | "flame" = "flame";

export default function Logo({ light = false }: { light?: boolean }) {
  const src =
    LOGO_VARIANT === "flame"
      ? light
        ? "/brand/logo-full-light-flame.png"
        : "/brand/logo-full-dark-flame.png"
      : LOGO_VARIANT === "orange"
        ? light
          ? "/brand/logo-full-light-orange.png"
          : "/brand/logo-full-dark-orange.png"
        : light
          ? "/brand/logo-full-light.png"
          : "/brand/logo-full-dark.png";

  return (
    <span className="logo">
      <img
        className="logo__img"
        src={src}
        alt={`${site.brand.name} ${site.brand.suffix}`}
        width={650}
        height={150}
        /* 首屏关键资源：不懒加载，避免 Logo 延迟出现 */
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
