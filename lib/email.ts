/**
 * Sends mail through a Google Apps Script web app (see scripts/gas-mailer.gs)
 * running MailApp under a Google account, instead of a paid transactional
 * email API. Returns the OTP code when no webhook is configured, so the
 * caller can surface it in dev (console + API response) instead of emailing
 * it. Returns undefined once a real email was sent.
 */
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<string | undefined> {
  const webhookUrl = process.env.GAS_MAIL_WEBHOOK_URL;
  const secret = process.env.GAS_MAIL_SECRET;

  if (!webhookUrl || !secret) {
    console.log(`[dev] OTP for ${email}: ${code}`);
    return code;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      to: email,
      subject: `Your Hello FOSS verification code: ${code}`,
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    }),
  });

  const data = await res.json().catch(() => ({ ok: false, error: res.statusText }));
  if (!res.ok || !data.ok) {
    throw new Error(`Failed to send OTP email: ${data.error ?? res.statusText}`);
  }

  return undefined;
}
