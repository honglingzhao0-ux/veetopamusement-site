import site from "@/site.config";
import { siteBaseUrl } from "@/lib/cdn";
import { getAllProducts, getCategories } from "@/lib/products";

export const dynamic = "force-static";

const baseUrl = siteBaseUrl(site.brand.domain);

/**
 * llms.txt —— 给 AI 引擎 / LLM 直接引用的事实清单（P0-3）。
 * 全部事实来自 site.config.ts（单点同源），产品清单由
 * data/products/*.json 构建期生成；robots.ts 不屏蔽 AI 爬虫。
 */
export function GET() {
  const facts = site.companyFacts;
  const products = getAllProducts();
  const categories = getCategories();
  const lines: string[] = [];

  lines.push(`# ${site.brand.name} ${site.brand.suffix}`);
  lines.push("");
  lines.push("> " + site.seo.description);
  lines.push(">");
  lines.push(
    `> Guangzhou Veetop Amusement Technology Co., Ltd. is a manufacturer in Guangzhou, China with ${facts.yearsInBusiness} years in the amusement game product industry. Exports to ${facts.exportCountries} countries and regions; market share of ${facts.marketShare}. Certifications: ${facts.certifications.join(", ")}.`,
  );
  lines.push(`> ${facts.oemOdmNote}`);
  lines.push("");
  lines.push(`Official website: ${baseUrl}`);
  lines.push(
    `Contact: ${site.contact.email} | WhatsApp ${site.contact.whatsapp.label}`,
  );
  lines.push(`Address: ${site.contact.address.line1}, ${site.contact.address.line2}`);
  lines.push("");
  lines.push("## Products");
  for (const p of products) {
    lines.push(
      `- [${p.name} (${p.model})](${baseUrl}/products/${p.slug}/): ${p.headline}`,
    );
  }
  lines.push("");
  lines.push("## Product Categories");
  for (const c of categories) {
    lines.push(
      `- [${c.name}](${baseUrl}/products/${c.slug}/): ${c.tagline}`,
    );
  }
  lines.push("");
  lines.push("## Pages");
  lines.push(
    `- [All Products](${baseUrl}/products/): ${categories.length} categories of commercial amusement equipment`,
  );
  lines.push(`- [About Us](${baseUrl}/about/): Factory strength, OEM/ODM, certifications`);
  lines.push(`- [FAQ](${baseUrl}/faq/): Quotations, payment, delivery, certification and OEM/ODM questions`);

  const text = lines.join("\n") + "\n";
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
