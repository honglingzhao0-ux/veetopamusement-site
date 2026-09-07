/**
 * 询盘提交共享逻辑：
 *  - 已配置 formEndpoint：fetch POST（Formspree / Web3Forms 兼容）
 *  - 未配置：浏览器端生成 mailto 链接（占位演示用）
 * 供 components/inquiry-form.tsx 与 components/quick-inquiry.tsx 复用。
 */

export interface SubmitResult {
  ok: boolean;
  message: string;
}

/** endpoint 场景：POST FormData，返回成功/失败与展示文案 */
export async function postInquiry(
  endpoint: string,
  form: FormData,
): Promise<SubmitResult> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: form,
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      let msg = "Your inquiry has been sent. Thank you!";
      try {
        const data = (await res.json()) as { message?: string; next?: string };
        if (typeof data.message === "string" && data.message) msg = data.message;
      } catch {
        /* ignore body parse - keep default message */
      }
      return { ok: true, message: msg };
    }
    return {
      ok: false,
      message: `Submission failed (status ${res.status}). Please try again or email us directly.`,
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
