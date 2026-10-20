import site from "@/site.config";

/**
 * 品牌 Logo（官方版）
 *
 * 2026-10-20 换用官方 Logo 素材：
 *   public/brand/logo-full-dark.png   深色字版（浅色背景用）
 *   public/brand/logo-full-light.png  反白字版（深色背景用）
 *   public/brand/logo-mark.png        仅 V 形标
 *
 * 官方 Logo 构成：蓝色渐变 V 形标 + 衬线体 VEETOP 字标。
 * 品牌色（从原图采样）：深蓝 #002665 / 亮蓝 #0071BD / 浅蓝 #34A2DD。
 *
 * 为什么用 PNG 而非 SVG：
 *   官方 Logo 是设计稿导出的位图，手绘 SVG 路径容易走样；
 *   PNG 在 header 尺寸（高约 34px）下完全够清晰，体积也可接受。
 *
 * light=true 时用反白版（深色页脚 / 深色背景）。
 */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="logo">
      <img
        className="logo__img"
        src={light ? "/brand/logo-full-light.png" : "/brand/logo-full-dark.png"}
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
