"use client";

import { useEffect } from "react";
import { trackProductView, trackInquiry, trackProductClick } from "@/lib/track";

/**
 * 全站统计挂载点（无视觉输出）
 *
 * 覆盖三类事件：
 *  1) 产品卡片点击 —— 事件委托捕获 [data-track-product]，无需给每张卡片包组件
 *  2) 产品详情页浏览 —— 从 URL 解析产品 slug（/products/<品类>/<产品slug>/）
 *  3) 询盘表单提交 —— 读取表单的 productInterest 字段
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

    // 3) 询盘表单提交
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      const fd = new FormData(form);
      const interest = String(fd.get("productInterest") ?? "").trim();
      if (interest) trackInquiry(interest);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}