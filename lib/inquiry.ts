/**
 * 询盘提交共享逻辑：
 *  - 已配置 formEndpoint：fetch POST（当前为 Web3Forms，兼容 Formspree / Web3Forms）
 *  - 未配置：浏览器端生成 mailto 链接（占位演示用）
 * 供 components/inquiry-form.tsx 与 components/quick-inquiry.tsx 复用。
 *
 * Web3Forms 与 Formspree 的差异（已处理）：
 *  1. Web3Forms 必须在请求体里带 `access_key`（Formspree 靠 URL 里的表单 ID）
 *  2. Web3Forms 官方示例用 JSON body；FormData 亦可，但 JSON 更稳（无 multipart 边界问题）
 *  3. Web3Forms 成功响应是 { success: true, message: "Email sent successfully!" }，
 *     Formspree 是 { ok: true, next: "/thanks" } —— 两者都要认
 *  4. Web3Forms 有 `botcheck` 蜜罐字段，机器人填了会被静默丢弃
 */

export interface SubmitResult {
  ok: boolean;
  message: string;
}

/** 判断是否为 Web3Forms 端点（需要 access_key + JSON body） */
function isWeb3Forms(endpoint: string): boolean {
  return endpoint.includes("web3forms.com");
}

/**
 * endpoint 场景：POST 表单数据，返回成功/失败与展示文案
 *
 * @param endpoint  提交端点
 * @param form      表单数据（FormData）
 * @param accessKey Web3Forms access key（可选，其它端点忽略）
 */
export async function postInquiry(
  endpoint: string,
  form: FormData,
  accessKey?: string,
): Promise<SubmitResult> {
  try {
    let res: Response;

    if (isWeb3Forms(endpoint)) {
      // Web3Forms：取 FormData 键值对，拼 JSON，带 access_key
      const entries: Record<string, string> = {};
      form.forEach((value, key) => {
        if (typeof value === "string") entries[key] = value;
      });
      if (accessKey) entries.access_key = accessKey;
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(entries),
      });
    } else {
      // Formspree 等：保持 FormData 原样提交
      res = await fetch(endpoint, {
        method: "POST",
        body: form,
        headers: { Accept: "application/json" },
      });
    }

    if (res.ok) {
      let msg = "Your inquiry has been sent. Thank you!";
      try {
        const data = (await res.json()) as {
          message?: string;
          next?: string;
          success?: boolean;
        };
        if (typeof data.message === "string" && data.message) msg = data.message;
        // Web3Forms 极少数情况：HTTP 200 但 success 为 false
        if (data.success === false) {
          return {
            ok: false,
            message:
              data.message ||
              "Submission failed. Please try again or email us directly.",
          };
        }
      } catch {
        /* ignore body parse - keep default message */
      }
      return { ok: true, message: msg };
    }

    // 失败时把服务端的具体原因带出来（Web3Forms 会返回明确描述）
    let detail = "";
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      detail = data.message || data.error || "";
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      message: detail
        ? `Submission failed: ${detail}`
        : `Submission failed (status ${res.status}). Please try again or email us directly.`,
    };
  } catch {
    return {
      ok: false,
      message:
        "Network error - could not reach the form service. Please email us directly or try WhatsApp.",
    };
  }
}

/** mailto 场景：按有序的 [label, value] 行拼装邮件正文链接 */
export function buildMailtoHref(
  email: string,
  subject: string,
  lines: Array<[string, string]>,
): string {
  const body = lines
    .filter(([, value]) => value && value.trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  return `mailto:${email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
