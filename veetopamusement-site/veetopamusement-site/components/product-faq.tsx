import type { FaqItem } from "@/site.config";

interface ProductFaqProps {
  faqs: FaqItem[];
  kicker?: string;
  title?: string;
  intro?: string;
}

/**
 * FAQ 手风琴（服务端组件，原生 <details>，无 JS 依赖）。
 * 三层复用：产品详情页 / 品类着陆页 / 独立 FAQ 页。
 */
export default function ProductFaq({
  faqs,
  kicker = "FAQ",
  title = "Frequently Asked Questions",
  intro,
}: ProductFaqProps) {
  if (!faqs.length) return null;
  return (
    <section className="faq-block" aria-label="Frequently asked questions">
      <header className="faq-block__head">
        <p className="kicker">{kicker}</p>
        <h2 className="h-lg">{title}</h2>
        {intro ? <p className="lede">{intro}</p> : null}
      </header>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <details key={`${f.q}-${i}`} className="faq-item" open={i === 0}>
            <summary>
              <span className="faq-item__q">{f.q}</span>
              <span className="faq-item__icon" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="faq-item__a">
              <p>{f.a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
