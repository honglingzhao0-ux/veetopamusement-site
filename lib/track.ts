/**
 * 点击统计上报（可在Server / Client 两侧安全引用）
 *
 * 用途：为首页 Flagship Models 选品提供真实点击/询盘热度依据。
 *
 * ⚠️ 通道隔离（重要）：
 *   浏览埋点与询盘表单**必须走不同通道**。
 *   原因：Web3Forms 免费版每月 250 次提交是**按账号统计**的，
 *   而每次产品页浏览都会产生一次提交 —— 若共用，真询盘会被埋点挤掉，
 *   且询盘邮件与 STAT: 埋点邮件混在同一收件箱，真询盘会被淹没。
 *
 *   这里使用 site.contact.tracking.accessKey（第二个邮箱注册的独立 key）。
 *   ⚠️ 若未配置独立 key，埋点**直接不发送**，绝不退回询盘通道。
 *
 * 隐私：只上报 事件类型 / 产品型号 / 来源路径 / referrer / 时间戳。
 *      不涉及 IP、Cookie、指纹、姓名邮箱等任何访客身份信息。
 */

import site from "@/site.config";

/**
 * 埋点专用端点。Web3Forms 的 access_key 绑定收件邮箱，
 * 所以只要 key 不同，收件邮箱就不同 —— 端点地址可以相同。
 */
const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_TRACK_ENDPOINT ||
  site.contact.formEndpoint ||
  "https://api.web3forms.com/submit";

/** 埋点专用 access key（与询盘通道不同）；未配置则埋点整体停用 */
const ACCESS_KEY = site.contact.tracking?.accessKey || "";

/** 本地开发时不上报，避免污染真实数据 */
function isDisabled(): boolean {
  if (typeof window === "undefined") return false; // SSR 阶段不动作
  if (process.env.NODE_ENV === "development") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function send(event: string, model: string): void {
  if (!model || typeof window === "undefined") return;
  if (isDisabled()) return;
  // 未配置独立埋点通道 → 直接放弃，绝不占用询盘额度
  if (!ACCESS_KEY) return;
  try {
    const fd = new FormData();
    fd.append("access_key", ACCESS_KEY);
    fd.append("_subject", `STAT: ${event} | ${model}`);
    fd.append("event", event);
    fd.append("model", model);
    fd.append("path", window.location.pathname);
    fd.append("referrer", document.referrer || "-");
    fd.append("ts", new Date().toISOString());
    if (navigator.sendBeacon) {
      navigator.sendBeacon(FORM_ENDPOINT, fd);
    } else {
      fetch(FORM_ENDPOINT, { method: "POST", body: fd, keepalive: true }).catch(
        () => {}
      );
    }
  } catch {
    /* 统计失败绝不打扰用户 */
  }
}

/** 产品卡片点击（由 Analytics 事件委托调用） */
export function trackProductClick(model: string): void {
  send("click", model);
}

/** 产品详情页浏览（同一会话 30 分钟内不重复计） */
export function trackProductView(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `veetop_seen_${slug}`;
    const last = Number(sessionStorage.getItem(key) || "0");
    if (Date.now() - last < 30 * 60 * 1000) return;
    sessionStorage.setItem(key, String(Date.now()));
    send("view", slug);
  } catch {
    /* ignore */
  }
}

/** 询盘提交（产品型号来自表单 productInterest） */
export function trackInquiry(model: string): void {
  send("inquiry", model);
}