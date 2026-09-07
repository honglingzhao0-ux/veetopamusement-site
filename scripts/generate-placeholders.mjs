/**
 * 占位产品图生成器（示例开发用，非构建必需）
 *
 * 用法： node scripts/generate-placeholders.mjs
 *
 * 说明：
 *  - 读取 data/categories.json 与 data/products/*.json；
 *  - 为每个产品在 public/images/products/<slug>.svg 生成一张占位图
 *    （按品类配色 + 简单线稿图标 + 产品名/型号水印，标注 SAMPLE）；
 *  - 后续替换真实照片时，把同名文件换成 JPG/PNG 即可（JSON 里的 images
 *    路径改为 /images/products/<slug>.jpg 即可，或直接覆盖本文件并保持
 *    扩展名 .svg 不变）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data", "products");
const outDir = path.join(root, "public", "images", "products");
fs.mkdirSync(outDir, { recursive: true });

const categories = JSON.parse(
  fs.readFileSync(path.join(root, "data", "categories.json"), "utf8"),
);
const catById = new Map(categories.map((c) => [c.id, c]));

// 每个品类的主色相（度）
const HUE = {
  "arcade-video-games": 12,
  "redemption-ticket-games": 196,
  "claw-crane-machines": 262,
  "kiddie-rides": 328,
  "sports-skill-games": 96,
  "prize-merchandisers": 40,
};

/* ---------- 每个品类一张简单线稿（居中绘制） ---------- */
const GLYPH = {
  "arcade-video-games": (h) => `
    <path d="M520 560V300c0-72 42-104 80-104s80 32 80 104v260" stroke="#fff" stroke-opacity=".9" stroke-width="7"/>
    <rect x="538" y="330" width="124" height="130" rx="8" stroke="#fff" stroke-opacity=".55" stroke-width="5"/>
    <rect x="546" y="338" width="46" height="46" fill="hsl(${h} 85% 55%)" opacity=".8"/>
    <path d="M520 470h160" stroke="#fff" stroke-opacity=".9" stroke-width="6"/>
    <circle cx="556" cy="510" r="12" stroke="#fff" stroke-width="5"/>
    <path d="M556 498v-20m0 0-12-12m12 12 12-12" stroke="hsl(${h} 90% 60%)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="612" cy="506" r="9" stroke="#fff" stroke-width="5"/>
    <circle cx="640" cy="506" r="9" stroke="#fff" stroke-width="5"/>
    <path d="M540 590h120" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-dasharray="2 14"/>
  `,
  "redemption-ticket-games": (h) => `
    <circle cx="600" cy="400" r="128" stroke="#fff" stroke-opacity=".9" stroke-width="7"/>
    <circle cx="600" cy="400" r="96" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-dasharray="10 18"/>
    <path d="M600 272v-52" stroke="#fff" stroke-opacity=".8" stroke-width="6"/>
    <path d="M600 528v56M472 400h-52M728 400h52" stroke="#fff" stroke-opacity=".5" stroke-width="6"/>
    <circle cx="600" cy="400" r="16" fill="hsl(${h} 90% 60%)"/>
    <rect x="560" y="320" width="22" height="40" rx="6" fill="hsl(${h} 90% 60%)"/>
    <rect x="600" y="300" width="22" height="40" rx="6" fill="#fff" opacity=".85"/>
    <rect x="640" y="330" width="22" height="40" rx="6" fill="hsl(${h} 90% 60%)"/>
    <path d="M440 640h320" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-dasharray="2 14"/>
  `,
  "claw-crane-machines": (h) => `
    <rect x="450" y="210" width="300" height="420" rx="14" stroke="#fff" stroke-opacity=".9" stroke-width="7"/>
    <rect x="470" y="240" width="260" height="330" rx="8" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>
    <path d="M490 250h220M600 250v52" stroke="hsl(${h} 90% 60%)" stroke-width="5"/>
    <path d="M600 302l0 34m0-34-18 10m18-10 18 10" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <path d="M600 336l-14 26h28Z" stroke="#fff" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <circle cx="540" cy="430" r="34" fill="hsl(${h} 80% 60%)" opacity=".85"/>
    <circle cx="630" cy="480" r="26" fill="#fff" opacity=".8"/>
    <circle cx="680" cy="420" r="22" fill="hsl(${h} 70% 45%)" opacity=".85"/>
    <path d="M450 590h300" stroke="#fff" stroke-opacity=".6" stroke-width="5"/>
  `,
  "kiddie-rides": (h) => `
    <path d="M430 460c10-70 70-110 170-110s160 40 170 110v80H430Z" stroke="#fff" stroke-opacity=".9" stroke-width="7" fill="none"/>
    <path d="M500 350 470 270l40-14 26 80" stroke="#fff" stroke-opacity=".8" stroke-width="6" fill="none"/>
    <circle cx="516" cy="282" r="26" fill="hsl(${h} 90% 60%)"/>
    <path d="M470 350l-26-52M482 320l-20-40" stroke="#fff" stroke-opacity=".6" stroke-width="5"/>
    <rect x="560" y="330" width="70" height="44" rx="10" stroke="#fff" stroke-width="6" fill="hsl(${h} 70% 45%)" opacity=".8"/>
    <path d="M470 536a52 52 0 0 1 104 0" stroke="#fff" stroke-width="7" fill="none"/>
    <circle cx="522" cy="560" r="30" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="7"/>
    <path d="M640 536a52 52 0 0 1 104 0" stroke="#fff" stroke-width="7" fill="none"/>
    <circle cx="692" cy="560" r="30" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="7"/>
    <path d="M430 590h340" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-dasharray="2 14"/>
  `,
  "sports-skill-games": (h) => `
    <rect x="520" y="220" width="120" height="230" stroke="#fff" stroke-opacity=".85" stroke-width="7"/>
    <path d="M500 260h160l-20-46h-120Z" stroke="#fff" stroke-opacity=".9" stroke-width="7" fill="none"/>
    <path d="M520 336a60 60 0 0 1 120 0" stroke="#fff" stroke-opacity=".9" stroke-width="6" fill="none"/>
    <circle cx="580" cy="300" r="26" fill="hsl(${h} 85% 55%)"/>
    <path d="M580 300l14 22m-14-22-14 22m14-22v28" stroke="#0b1b2b" stroke-width="4"/>
    <path d="M430 560h340" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-dasharray="2 14"/>
  `,
  "prize-merchandisers": (h) => `
    <rect x="460" y="200" width="280" height="430" rx="14" stroke="#fff" stroke-opacity=".9" stroke-width="7"/>
    <rect x="482" y="240" width="236" height="320" rx="8" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>
    <path d="M482 320h236M482 400h236M482 480h236" stroke="#fff" stroke-opacity=".25" stroke-width="4"/>
    <circle cx="540" cy="360" r="34" fill="hsl(${h} 85% 55%)" opacity=".9"/>
    <circle cx="630" cy="440" r="30" fill="#fff" opacity=".85"/>
    <rect x="536" y="500" width="120" height="14" rx="7" fill="hsl(${h} 85% 55%)" opacity=".9"/>
    <path d="M470 590h260" stroke="#fff" stroke-opacity=".6" stroke-width="5"/>
  `,
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function buildSvg({ hue, catName, name, model, accentHex }) {
  const glyph = (GLYPH[catName] ?? GLYPH["arcade-video-games"])(hue);
  const rgb = hexToRgb(accentHex);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1b2b"/>
      <stop offset="1" stop-color="#12283c"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".42" r=".6">
      <stop offset="0" stop-color="rgba(${rgb},.16)"/>
      <stop offset="1" stop-color="rgba(${rgb},0)"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <rect width="1200" height="900" fill="url(#glow)"/>
  <g stroke="rgba(255,255,255,.05)" stroke-width="1">
    <path d="M0 90h1200M0 180h1200M0 270h1200M0 360h1200M0 450h1200M0 540h1200M0 630h1200M0 720h1200M0 810h1200"/>
    <path d="M90 0v900M180 0v900M270 0v900M360 0v900M450 0v900M540 0v900M630 0v900M720 0v900M810 0v900M900 0v900M990 0v900M1080 0v900M1170 0v900"/>
  </g>
  <rect x="34" y="34" width="1132" height="832" rx="18" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
  <text x="74" y="92" fill="#fff" opacity=".85" font-family="Consolas, monospace" font-size="26" letter-spacing="6">SAMPLE ARTWORK</text>
  <text x="1126" y="92" text-anchor="end" fill="hsl(${hue} 90% 62%)" font-family="Consolas, monospace" font-size="26" letter-spacing="4">${model}</text>
  <text x="1126" y="840" text-anchor="end" fill="rgba(255,255,255,.55)" font-family="Consolas, monospace" font-size="22" letter-spacing="4">REPLACE WITH PRODUCT PHOTO</text>
  ${glyph}
  <text x="80" y="820" fill="#fff" font-family="Bahnschrift, 'Arial Narrow', Arial, sans-serif" font-weight="700" font-size="54" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="80" y="760" fill="hsl(${hue} 85% 62%)" font-family="Bahnschrift, Arial, sans-serif" font-weight="700" font-size="24" letter-spacing="6">${catName.toUpperCase()}</text>
</svg>
`;
}

const palette = [
  "#f4511e", "#e14b8b", "#8e5cff", "#ff6b35", "#e84545", "#f5a623",
  "#2fa8e0", "#23b573", "#d65db1", "#f7b32b", "#3dbfae", "#5c8dff",
];

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
let generated = 0;
for (const f of files) {
  const p = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
  const cat = catById.get(p.category);
  if (!cat) {
    console.warn(`skip ${f}: unknown category ${p.category}`);
    continue;
  }
  const idx = [...catById.keys()].indexOf(p.category);
  const hue = HUE[p.category] ?? (idx * 47 + 12) % 360;
  const accent = palette[(idx + 4) % palette.length];
  const svg = buildSvg({
    hue,
    catName: cat.name,
    name: p.name,
    model: p.model,
    accentHex: accent,
  });
  fs.writeFileSync(path.join(outDir, `${p.slug}.svg`), svg, "utf8");
  generated += 1;
}
console.log(`generated ${generated} placeholder SVGs in public/images/products/`);
