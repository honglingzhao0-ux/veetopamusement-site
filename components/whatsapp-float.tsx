"use client";

import { useEffect, useState } from "react";
import site from "@/site.config";
import { trackConversion } from "@/lib/track";

/**
 * WhatsApp 浮动询盘按钮
 *
 * 为什么需要：海外买家（尤其南美、中东、东南亚）的习惯是直接 WhatsApp 秒回，
 * 而不是填表单。表单要 3 个必填项（姓名/邮箱/留言），摩擦高；
 * WhatsApp 一点就通，转化路径最短。
 *
 * 行为：
 *   · 右下角固定，滚动始终可见
 *   · 点击展开预填消息的小窗（让用户看到会发什么，可编辑后再发）——
 *     直接跳转会丢失上下文，用户不知道该问什么
 *   · 移动端缩小，避免遮挡内容
 *
 * ⚠️ 埋点（2026-11-24 补）：此前**完全没有埋点**，
 *    导致"点开 WhatsApp 并真的发出去"这个最强转化信号在数据里完全消失。
 *    现在记录两个事件：
 *      whatsapp_open —— 展开面板（有兴趣）
 *      whatsapp_send —— 点了 Open WhatsApp（真正发起询盘）
 *    两者都要记 —— 只有 open 没有 send，说明是"看了又走"。
 *
 * 无障碍：aria-label + title，按钮有可见文字（非纯图标）。
 */
export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(
    "Hello VEETOP, I am interested in your amusement machines. Please send me the price list and MOQ.",
  );

  // 桌面端 3 秒后轻微提示一下（移动端不打扰）
  useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches) return;
    const t = window.setTimeout(() => setOpen(true), 3000);
    return () => window.clearTimeout(t);
  }, []);

  const number = site.contact.whatsapp.number;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

  /** 当前页的产品型号（如果有），让询盘能归到具体机型 */
  function currentModel(): string | undefined {
    if (typeof document === "undefined") return undefined;
    // 报价按钮带 data-track-quote，产品卡片带 data-track-product
    const q = document.querySelector<HTMLElement>("[data-track-quote]");
    if (q?.dataset.trackQuote) return q.dataset.trackQuote;
    const p = document.querySelector<HTMLElement>("[data-track-product]");
    return p?.dataset.trackProduct || undefined;
  }

  return (
    <>
      {open && (
        <div className="wa-panel" role="dialog" aria-label="WhatsApp inquiry">
          <div className="wa-panel__head">
            <strong>Chat with our export team</strong>
            <button
              type="button"
              className="wa-panel__close"
              onClick={() => setOpen(false)}
              aria-label="Close WhatsApp inquiry"
            >
              ×
            </button>
          </div>
          <p className="wa-panel__hint">
            Send us the model, quantity and destination port — we reply with
            price, MOQ and delivery terms.
          </p>
          <textarea
            className="wa-panel__msg"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={3}
            aria-label="Message to send via WhatsApp"
          />
          <a
            className="wa-panel__send"
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackConversion("whatsapp_send", currentModel())}
          >
            Open WhatsApp
          </a>
        </div>
      )}

      <button
        type="button"
        className={"wa-float" + (open ? " is-open" : "")}
        onClick={() => {
          // 只记录"手动点开"，自动展开（3 秒）不记 —— 否则数据全是噪音
          if (!open) trackConversion("whatsapp_open", currentModel());
          setOpen((v) => !v);
        }}
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <svg
          className="wa-float__icon"
          viewBox="0 0 24 24"
          width="26"
          height="26"
          aria-hidden="true"
          fill="currentColor"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24Zm-2.6 4.03c-.14 0-.37.05-.56.26-.2.21-.74.73-.9 1.06-.16.32-.32.69-.06 1.12.26.42.97 1.61 2.08 2.34 1.11.73 2.04.95 2.33 1.06.29.1.57.05.78-.11.21-.16.74-.72.94-.97.2-.26.4-.42.57-.66.16-.24.08-.46-.04-.64-.12-.18-.57-1.39-.79-1.9-.2-.47-.41-.4-.57-.41h-.48Z" />
        </svg>
        <span className="wa-float__label">Chat</span>
      </button>
    </>
  );
}
