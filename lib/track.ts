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
 * 🛡️ 额度保护（2026-10-30 新增）：
 *   即使配了独立 key，埋点仍可能撞穿 Web3Forms 免费版的 250 次/月配额
 *   （爬虫批量翻页、用户狂刷产品页都会放大消耗）。
 *   因此加了三层闸门：
 *     ① 单次会话最多 maxPerSession 条
 *     ② 同一浏览器每天最多 maxPerDay 条
 *     ③ 同一型号 30 分钟内只记一次（跨标签页生效）
 *   超出即静默丢弃，**永远优先保证真询盘额度**。
 *
 * 隐私：只上报 事件类型 / 产品型号 / 来源路径 / referrer / 时间戳。
 *      不涉及 IP、Cookie、指纹、姓名邮箱等任何访客身份信息。
 */

import site from "@/site.config";

/**
 * 埋点专用端点。Web3Forms 的 access_key 绑定收件邮箱，
 * 所以只要 key 不同，收件邮箱就不同 —— 端点地址可以相同。
 *
 * 优先级：环境变量 > site.config.ts（便于不发版即开关埋点）。
 */
const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_TRACK_ENDPOINT ||
  site.contact.formEndpoint ||
  "https://api.web3forms.com/submit";

/** 埋点专用 access key（与询盘通道不同）；未配置则埋点整体停用 */
const ACCESS_KEY =
  process.env.NEXT_PUBLIC_TRACK_ACCESS_KEY ||
  site.contact.tracking?.accessKey ||
  "";

/** 额度保护阈值 */
const LIMITS = {
  /** 单次会话最多上报条数 */
  perSession: site.contact.tracking?.maxPerSession ?? 20,
  /** 同一浏览器每天最多上报条数 */
  perDay: site.contact.tracking?.maxPerDay ?? 80,
  /** 同型号去重窗口（毫秒） */
  dedupeMs: 30 * 60 * 1000,
};

/** 本地开发时不上报，避免污染真实数据 */
function isDisabled(): boolean {
  if (typeof window === "undefined") return false; // SSR 阶段不动作
  if (process.env.NODE_ENV === "development") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/** 今天日期字符串（用于每日计数键） */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 额度闸门：会话计数 + 每日计数。
 * 任何一层超限即返回 false，本次事件丢弃。
 */
function withinQuota(): boolean {
  try {
    // ① 会话计数
    const sKey = "veetop_stat_session_count";
    const sCount = Number(sessionStorage.getItem(sKey) || "0");
    if (sCount >= LIMITS.perSession) return false;

    // ② 每日计数（跨会话，用 localStorage）
    const dKey = `veetop_stat_day_${today()}`;
    const dCount = Number(localStorage.getItem(dKey) || "0");
    if (dCount >= LIMITS.perDay) return false;

    sessionStorage.setItem(sKey, String(sCount + 1));
    localStorage.setItem(dKey, String(dCount + 1));
    return true;
  } catch {
    // 隐私模式 / 存储被禁：宁可不报，也不冒超额风险
    return false;
  }
}

function send(event: string, model: string): void {
  if (!model || typeof window === "undefined") return;
  if (isDisabled()) return;
  // 未配置独立埋点通道 → 直接放弃，绝不占用询盘额度
  if (!ACCESS_KEY) return;
  // 超额度 → 静默丢弃
  if (!withinQuota()) return;
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

/**
 * 产品详情页浏览（同一型号 30 分钟内不重复计，跨标签页生效）
 *
 * 用 localStorage 而非 sessionStorage：同一用户在新标签页打开同一产品，
 * 不应被当成两个独立浏览。
 */
export function trackProductView(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `veetop_seen_${slug}`;
    const last = Number(localStorage.getItem(key) || "0");
    if (Date.now() - last < LIMITS.dedupeMs) return;
    localStorage.setItem(key, String(Date.now()));
    send("view", slug);
  } catch {
    /* ignore */
  }
}

/** 询盘提交（产品型号来自表单 productInterest） */
export function trackInquiry(model: string): void {
  send("inquiry", model);
}
