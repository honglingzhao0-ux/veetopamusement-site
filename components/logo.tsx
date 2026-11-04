import site from "@/site.config";

/**
 * 品牌 Logo（官方红金版）
 *
 * 素材（由 scripts/make-logo-redgold.py 生成）：
 *   public/brand/logo-full-dark.png    红金 V 标 + 深蓝衬线字标（浅色背景用）
 *   public/brand/logo-full-light.png   同上，字标反白（深色页脚用）
 *   public/brand/logo-mark.png         仅 V 形标
 *
 * 官方 Logo 构成：红色 V 斜面 + 金色 V 右侧面（带立体渐变与描边），
 * 搭配深蓝色衬线体 VEETOP 字标。
 *
 * 为什么用 PNG 而非 SVG：
 *   官方 Logo 是设计稿导出的位图，手绘 SVG 路径容易走样；
 *   PNG 在 header 尺寸（高约 30px）下完全够清晰，体积也可接受。
 *
 * 反白版的处理要点（scripts/make-logo-redgold.py 内有详细注释）：
 *   字标必须**整段**替换为纯白，不能逐像素挑深蓝改白 ——
 *   原字标自带白色高光边和深蓝描边，逐像素改会留下脏边光晕。
 *   切缝取 x=348（V 标最右 334 与字标最左 364 之间的纯空白带）。
 *
 * LOGO_VARIANT 改这一个常量即可切换配色
 * （"redgold" | "blue" | "orange" | "flame"）。
 * light=true 时用反白版（深色页脚 / 深色背景）。
 */
const LOGO_VARIANT: "redgold" | "blue" | "orange" | "flame" = "redgold";

export default function Logo({ light = false }: { light?: boolean }) {
  const src =
    LOGO_VARIANT === "redgold"
      ? light
        ? "/brand/logo-full-light.png"
        : "/brand/logo-full-dark.png"
      : LOGO_VARIANT === "flame"
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
        width={1012}
        height={347}
        /* 首屏关键资源：不懒加载，避免 Logo 延迟出现 */
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
