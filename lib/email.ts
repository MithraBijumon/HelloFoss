export function isMailConfigured(): boolean {
  return Boolean(process.env.GAS_MAIL_WEBHOOK_URL && process.env.GAS_MAIL_SECRET);
}

/**
 * Whether OTP codes can be issued at all. In production that requires a real
 * mailer — the dev fallback hands the code to whoever asked for it, which
 * would make email verification meaningless.
 */
export function canSendOtp(): boolean {
  return isMailConfigured() || process.env.NODE_ENV !== "production";
}

function otpEmailHtml(code: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0a0a0a">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#15803d;font-family:monospace">Hello FOSS</p>
  <h1 style="margin:0 0 16px;font-size:20px">Your verification code</h1>
  <p style="margin:0 0 8px;font-size:32px;font-weight:600;letter-spacing:8px;font-family:monospace">${code}</p>
  <p style="margin:16px 0 0;font-size:14px;color:#6b7280">It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
</div>`;
}

/**
 * Sends mail through a Google Apps Script web app (see scripts/gas-mailer.gs)
 * running MailApp under a Google account, instead of a paid transactional
 * email API. Outside production, when no webhook is configured, returns the
 * OTP code so the caller can surface it (console + API response) instead of
 * emailing it. Returns undefined once a real email was sent.
 */
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<string | undefined> {
  const webhookUrl = process.env.GAS_MAIL_WEBHOOK_URL;
  const secret = process.env.GAS_MAIL_SECRET;

  if (!webhookUrl || !secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("GAS_MAIL_WEBHOOK_URL/GAS_MAIL_SECRET are not set");
    }
    console.log(`[dev] OTP for ${email}: ${code}`);
    return code;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      to: email,
      subject: `${code} is your Hello FOSS verification code`,
      text: `Your Hello FOSS verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      html: otpEmailHtml(code),
    }),
  });

  const data = await res.json().catch(() => ({ ok: false, error: res.statusText }));
  if (!res.ok || !data.ok) {
    throw new Error(`Failed to send OTP email: ${data.error ?? res.statusText}`);
  }

  return undefined;
}
