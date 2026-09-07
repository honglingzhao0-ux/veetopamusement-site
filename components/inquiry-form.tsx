"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import site from "@/site.config";
import { postInquiry, buildMailtoHref } from "@/lib/inquiry";

const QUANTITY_OPTIONS = [
  "1-5 units (sample / trial)",
  "5-20 units",
  "20-50 units",
  "50+ units / full container",
];

const BUSINESS_TYPE_OPTIONS = [
  "Arcade / FEC operator",
  "Distributor / wholesaler",
  "Retailer / online seller",
  "OEM / ODM project",
  "Other",
];

/**
 * 询盘表单（/contact/ 全字段版）。
 *
 * 接线说明（见 site.config.ts contact.formEndpoint）：
 *  - formEndpoint 为空（当前默认）：提交时在浏览器端生成 mailto 邮件，
 *    适合本地演示（会打开本机邮件客户端）；
 *  - formEndpoint 填写 Formspree/Web3Forms 等端点后：fetch POST 提交，
 *    成功显示提示并跳转 /thank-you/ 确认页，失败显示错误信息。
 */
export default function InquiryForm() {
  const endpoint = site.contact.formEndpoint;
  const [product, setProduct] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("product");
    if (p) setProduct(p);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

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
      `Website inquiry: ${fd.get("productInterest") || "general"}`,
      [
        ["Name", String(fd.get("name") ?? "")],
        ["Company", String(fd.get("company") ?? "")],
        ["Email", String(fd.get("email") ?? "")],
        ["Country / Region", String(fd.get("country") ?? "")],
        ["Product interest", String(fd.get("productInterest") ?? "")],
        ["Estimated quantity", String(fd.get("quantity") ?? "")],
        ["I am a", String(fd.get("businessType") ?? "")],
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
    <form
      className="form-card"
      onSubmit={handleSubmit}
      noValidate={false}
    >
      <p className="kicker">Inquiry</p>
      <h2 className="h-lg">Request a Quote</h2>
      <p>{site.contact.formNote}</p>

      {/* 场景化附加字段（endpoint 场景一并随 POST 提交；Formspree/Web3Forms 均兼容） */}
      {endpoint && (
        <input type="hidden" name="_subject" value="VEETOP website inquiry" />
      )}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="f-name">
            Name <em>*</em>
          </label>
          <input id="f-name" name="name" required autoComplete="name" placeholder="Your full name" />
        </div>
        <div className="field">
          <label htmlFor="f-company">Company</label>
          <input id="f-company" name="company" autoComplete="organization" placeholder="Company / venue name" />
        </div>
        <div className="field">
          <label htmlFor="f-email">
            Email <em>*</em>
          </label>
          <input id="f-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
        </div>
        <div className="field">
          <label htmlFor="f-country">Country / Region</label>
          <input id="f-country" name="country" autoComplete="country-name" placeholder="e.g. United States" />
        </div>
        <div className="field">
          <label htmlFor="f-qty">Estimated Quantity</label>
          <select id="f-qty" name="quantity" defaultValue="">
            <option value="" disabled>
              Select...
            </option>
            {QUANTITY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-btype">I am a...</label>
          <select id="f-btype" name="businessType" defaultValue="">
            <option value="" disabled>
              Select...
            </option>
            {BUSINESS_TYPE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="field field--full">
          <label htmlFor="f-product">Product of Interest</label>
          <input
            id="f-product"
            name="productInterest"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. VT-CRN-601 Claw Crane, or describe your need"
          />
        </div>
        <div className="field field--full">
          <label htmlFor="f-message">
            Message <em>*</em>
          </label>
          <textarea
            id="f-message"
            name="message"
            required
            placeholder="Models, quantity, destination port, target date..."
          />
        </div>
      </div>

      <button type="submit" className="btn btn--accent btn--block" style={{ marginTop: 18 }} disabled={busy}>
        {busy ? "Sending..." : "Send Inquiry"}
      </button>
      <p className="form-note">
        We reply within 24 business hours. Your data is only used to respond to
        this inquiry.
      </p>
      {status && (
        <p className={"form-status" + (status.ok ? "" : " form-status--err")}>
          {status.text}
        </p>
      )}
    </form>
  );
}
