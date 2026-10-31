/**
 * 点击统计上报（可在 Server / Client 两侧安全引用）
 *
 * 用途：为首页 Flagship Models 选品提供真实点击/询盘热度依据。
 *
 * ⚠️ 单邮箱共用额度的现实约束（2026-10-31 定稿）：
 *   本站只用一个收件邮箱 sales@veetopamusement.com，对应一个 Web3Forms
 *   access_key —— Web3Forms 免费版的 250 次/月是**账号级**的，
 *   埋点与询盘共用这个 key 就共用这 250 次。
 *   （用同一个邮箱注册多个 key 并不会得到独立配额。）
 *
 *   所以本模块的策略不是"换通道"，而是**把埋点消耗压到可以忽略**：
 *     ① 询盘事件不再单独上报 —— 一次真询盘只消耗 1 次额度。
 *        （旧实现里表单提交 + submit 监听器各发一次，白白双倍消耗。）
 *     ② 浏览/点击事件**批量打包**：攒够 N 条或页面隐藏时才发一次，
 *        一封邮件携带多条事件，1 次额度换回 N 条数据。
 *     ③ 三层闸门兜底：单会话、单日、单月条数上限，
 *        爬虫狂刷也撞不穿，真询盘额度永远优先。
 *
 * 🛡️ 保护层次（任一层超限即静默丢弃该条埋点）：
 *     单次会话 ≤ maxPerSession 条事件
 *     同一浏览器每天 ≤ maxPerDay 条事件
 *     同一浏览器每月 ≤ maxPerMonth 条事件
 *     同一型号 30 分钟内只记一次（跨标签页生效）
 *
 * 隐私：只上报 事件类型 / 产品型号 / 来源路径 / referrer / 时间戳。
 *      不涉及 IP、Cookie、指纹、姓名邮箱等任何访客身份信息。
 */

import site from "@/site.config";

/**
 * 埋点端点。与询盘同一个 Web3Forms 端点 —— 但因为共用 key，
 * Web3Forms 会把它们**混在同一个收件箱**。所以埋点邮件必须靠
 * `_subject` 前缀区分（见 analyze-stats.py 的解析逻辑）。
 */
const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_TRACK_ENDPOINT ||
  site.contact.formEndpoint ||
  "https://api.web3forms.com/submit";

/**
 * 埋点用的 access key。
 * 默认复用询盘 key（同一个 sales@ 邮箱）——
 * 由环境变量 NEXT_PUBLIC_TRACK_ACCESS_KEY 覆盖时才会走别的 key。
 */
const ACCESS_KEY =
  process.env.NEXT_PUBLIC_TRACK_ACCESS_KEY ||
  site.contact.tracking?.accessKey ||
  site.contact.formAccessKey ||
  "";

/** 额度保护阈值 */
const LIMITS = {
  /** 单次会话最多上报事件数 */
  perSession: site.contact.tracking?.maxPerSession ?? 20,
  /** 同一浏览器每天最多上报事件数 */
  perDay: site.contact.tracking?.maxPerDay ?? 80,
  /** 同一浏览器每月最多上报事件数（真正的月度兜底） */
  perMonth: site.contact.tracking?.maxPerMonth ?? 150,
  /** 攒够多少条事件打包发一次 */
  batchSize: site.contact.tracking?.batchSize ?? 5,
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

/** 本月日期字符串（用于每月计数键） */
function thisMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * 额度闸门：会话 / 每日 / 每月三重计数。
 * 任何一层超限即返回 false，本次事件丢弃。
 *
 * 注意 monthly 是**按浏览器**统计的，不是全局 —— 但它与 daily/session
 * 叠加后，单个访客能占用的额度上限极低（每月 ≤150 条事件），
 * 足以保证 250 次的账号配额不会被埋点吃光。
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

    // ③ 每月计数 —— 保住账号级配额的兜底
    const mKey = `veetop_stat_month_${thisMonth()}`;
    const mCount = Number(localStorage.getItem(mKey) || "0");
    if (mCount >= LIMITS.perMonth) return false;

    sessionStorage.setItem(sKey, String(sCount + 1));
    localStorage.setItem(dKey, String(dCount + 1));
    localStorage.setItem(mKey, String(mCount + 1));
    return true;
  } catch {
    // 隐私模式 / 存储被禁：宁可不报，也不冒超额风险
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* 批量打包                                                            */
/* ------------------------------------------------------------------ */

/** 一条埋点事件 */
interface StatEvent {
  event: string;
  model: string;
  path: string;
  referrer: string;
  ts: string;
}

/** 待发送队列的 localStorage 键 */
const QUEUE_KEY = "veetop_stat_queue";

function readQueue(): StatEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as StatEvent[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: StatEvent[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
}

/** 把队列里的事件一次性发出（1 次额度换 N 条数据） */
function flushQueue(): void {
  const q = readQueue();
  if (!q.length) return;
  // 先清队列再发，避免 sendBeacon 失败导致重复发送
  writeQueue([]);
  try {
    const fd = new FormData();
    fd.append("access_key", ACCESS_KEY);
    // 主题带事件数，方便在收件箱里一眼看出这是打包邮件
    fd.append("_subject", `STAT: batch | ${q.length} event(s)`);
    fd.append("event", "batch");
    fd.append("model", q.map((e) => e.model).join(","));
    fd.append("count", String(q.length));
    // 明细用 JSON 放在 events 字段，analyze-stats.py 会解析它
    fd.append("events", JSON.stringify(q));
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

/** 入队一条事件；攒够 batchSize 就打包发出 */
function enqueue(ev: StatEvent): void {
  try {
    const q = readQueue();
    q.push(ev);
    writeQueue(q);
    if (q.length >= LIMITS.batchSize) flushQueue();
  } catch {
    /* ignore */
  }
}

function send(event: string, model: string): void {
  if (!model || typeof window === "undefined") return;
  if (isDisabled()) return;
  // 未配置 key → 直接放弃
  if (!ACCESS_KEY) return;
  // 超额度 → 静默丢弃
  if (!withinQuota()) return;
  enqueue({
    event,
    model,
    path: window.location.pathname,
    referrer: document.referrer || "-",
    ts: new Date().toISOString(),
  });
}

/** 页面隐藏/关闭时把残留事件发出去（sendBeacon 在此时最可靠） */
function installFlushOnHide(): void {
  if (typeof window === "undefined") return;
  if ((window as unknown as { __veetopStatFlush?: boolean }).__veetopStatFlush)
    return;
  (window as unknown as { __veetopStatFlush?: boolean }).__veetopStatFlush = true;
  const flush = () => {
    if (readQueue().length) flushQueue();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}

/** 产品卡片点击（由 Analytics 事件委托调用） */
export function trackProductClick(model: string): void {
  installFlushOnHide();
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
  installFlushOnHide();
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

/**
 * 询盘事件 —— **不再单独上报**。
 *
 * 原因：一次真询盘本来就会由 inquiry-form 通过 Web3Forms 发出一封邮件，
 * 如果这里再发一次，等于把最宝贵的真询盘额度消耗两次。
 * 真询盘本身就是最强的选品信号，不需要额外埋点。
 *
 * 保留这个函数是为了兼容既有调用点（analytics.tsx），
 * 它现在只做本地留痕，不产生任何网络请求。
 */
export function trackInquiry(model: string): void {
  if (!model || typeof window === "undefined") return;
  try {
    // 本地计数，供 analyze-stats.py 之外的人工核对使用
    const key = "veetop_stat_local_inquiries";
    const n = Number(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(n));
  } catch {
    /* ignore */
  }
}
