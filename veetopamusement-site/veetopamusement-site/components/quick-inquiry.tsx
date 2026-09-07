"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import site from "@/site.config";
import { postInquiry, buildMailtoHref } from "@/lib/inquiry";

interface QuickInquiryProps {
  /** 预填产品标识，如 "VT-CRN-601 - Standard Claw Crane" */
  product: string;
  note?: string;
}

/**
 * 产品详情页"底部就地询盘区"（P0-4）。
 * 与 /contact/ 全字段表单共用 formEndpoint / mailto 兜底逻辑（lib/inquiry.ts）。
 */
export default function QuickInquiry({
  product,
  note = "Send us your target quantity and destination - our export team replies within 24 business hours (usually much faster). Your information is only used to respond to this inquiry.",
}: QuickInquiryProps) {
  const endpoint = site.contact.formEndpoint;
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!fd.get("product")) fd.set("product", product);

    if (endpoint) {
      setBusy(true);
      const res = await postInquiry(endpoint, fd);
      setBusy(false);
      setStatus({ ok: res.ok, text: res.message });
      if (res.ok) {
        window.setTimeout(() => {
          window.location.href = "/thank-you/";
        }, 1400);
      }
      return;
    }

    const href = buildMailtoHref(
      site.contact.email,
      `Inquiry: ${product}`,
      [
        ["Name", String(fd.get("name") ?? "")],
        ["Email", String(fd.get("email") ?? "")],
        ["WhatsApp", String(fd.get("whatsapp") ?? "")],
        ["Product", product],
        ["Message", String(fd.get("message") ?? "")],
      ],
    );
    window.location.href = href;
    setStatus({
      ok: true,
      text: "Opening your email app to send the inquiry...",
    });
  }

  return (
    <section
      className="quick-inquiry"
      id="quick-inquiry"
      aria-label="Quick inquiry form"
    >
      <div className="quick-inquiry__card">
        <header className="quick-inquiry__head">
          <p className="kicker">Quick Inquiry</p>
          <h2 className="h-lg">Get a Quote for {product}</h2>
          <p>{note}</p>
        </header>
        <form onSubmit={handleSubmit} className="quick-inquiry__form">
          <input type="hidden" name="product" value={product} readOnly />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="qi-name">
                Name <em>*</em>
              </label>
              <input
                id="qi-name"
                name="name"
                required
                autoComplete="name"
                placeholder="Your full name"
              />
            </div>
            <div className="field">
              <label htmlFor="qi-email">
                Email <em>*</em>
              </label>
              <input
                id="qi-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
              />
            </div>
            <div className="field">
              <label htmlFor="qi-wa">WhatsApp</label>
              <input
                id="qi-wa"
                name="whatsapp"
                autoComplete="tel"
                placeholder="+1 234 567 8900 (with country code)"
              />
            </div>
            <div className="field field--full">
              <label htmlFor="qi-msg">
                Message <em>*</em>
              </label>
              <textarea
                id="qi-msg"
                name="message"
                required
                placeholder="Quantity, destination port, target date..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn--accent"
            disabled={busy}
            style={{ marginTop: 16 }}
          >
            {busy ? "Sending..." : "Send Inquiry"}
          </button>
          {status && (
            <p
              className={"form-status" + (status.ok ? "" : " form-status--err")}
            >
              {status.text}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
