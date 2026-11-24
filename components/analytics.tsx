"use client";

import { useEffect } from "react";
import {
  trackProductView,
  trackInquiry,
  trackProductClick,
  trackConversion,
} from "@/lib/track";

/**
 * 全站统计挂载点（无视觉输出）
 *
 * 覆盖四类事件：
 *  1) 产品卡片点击 —— 事件委托捕获 [data-track-product]，无需给每张卡片包组件
 *  2) 产品详情页浏览 —— 从 URL 解析产品 slug（/products/<品类>/<产品slug>/）
 *  3) 询盘表单提交 —— 读取表单的 productInterest 字段
 *  4) 转化动作（2026-11-24 新增）—— [data-track-quote] 报价按钮
 *
 * ⚠️ 为什么第 4 类走事件委托而不是 onClick：
 *   产品详情页是 **server component**，不能直接写 onClick（Next.js 会构建报错）。
 *   委托到 document 上是唯一干净的做法，也不用给每个按钮包一层客户端组件。
 *
 * 埋点失败一律静默降级，绝不影响用户浏览与转化。
 * 本地开发（localhost）与未配置时自动跳过，不污染真实数据。
 */
export default function Analytics() {
  useEffect(() => {
    // 1) 产品详情页浏览
    const m = window.location.pathname.match(/^\/products\/[^/]+\/([^/]+)\/?$/);
    if (m) trackProductView(m[1]);

    // 2) 产品卡片点击（事件委托，覆盖首页/列表/相关产品所有卡片）
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "[data-track-product]"
      );
      const model = el?.getAttribute("data-track-product");
      if (model) trackProductClick(model);
    };

    // 2b) 报价按钮点击（转化信号，独立于产品点击统计）
    const onQuoteClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "[data-track-quote]"
      );
      if (!el) return;
      const model = el.getAttribute("data-track-quote") || undefined;
      trackConversion("quote_click", model);
    };

    // 3) 询盘表单提交
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      const fd = new FormData(form);
      const interest = String(fd.get("productInterest") ?? "").trim();
      if (interest) trackInquiry(interest);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("click", onQuoteClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("click", onQuoteClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}