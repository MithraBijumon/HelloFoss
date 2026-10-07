import { prisma } from "@/lib/db";

/**
 * Mail goes through Google Apps Script web apps (see scripts/gas-mailer.gs)
 * running MailApp under Google accounts, instead of a paid transactional
 * email API. Each account has a daily sending quota, so admins can register
 * several senders (MailSender rows, managed on /admin); mail goes through
 * the enabled ones in priority order and falls through to the next one when
 * a send fails. GAS_MAIL_WEBHOOK_URL/GAS_MAIL_SECRET act as a last resort.
 */

type Sender = {
  /** null for the env-var sender, which has no DB row to record status on. */
  id: string | null;
  label: string;
  webhookUrl: string;
  secret: string;
};

type MailerResponse = { ok: boolean; error?: string; remaining?: number };

// Apps Script cold starts plus a MailApp send can take well over 10s.
const MAILER_TIMEOUT_MS = 30_000;

/** Apps Script web app URLs look like https://script.google.com/macros/s/<id>/exec. */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "script.google.com";
  } catch {
    return false;
  }
}

async function getSenders(): Promise<Sender[]> {
  const rows = await prisma.mailSender.findMany({
    where: { enabled: true },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
  const senders: Sender[] = rows.map((r) => ({
    id: r.id,
    label: r.label,
    webhookUrl: r.webhookUrl,
    secret: r.secret,
  }));

  const envUrl = process.env.GAS_MAIL_WEBHOOK_URL;
  const envSecret = process.env.GAS_MAIL_SECRET;
  if (envUrl && envSecret) {
    senders.push({ id: null, label: "Environment variables", webhookUrl: envUrl, secret: envSecret });
  }
  return senders;
}

/**
 * Whether OTP codes can be issued at all. In production that requires at
 * least one mailer. The dev fallback hands the code to whoever asked for it,
 * which would make email verification meaningless.
 */
export async function canSendOtp(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return true;
  return (await getSenders()).length > 0;
}

async function callMailer(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<MailerResponse> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(MAILER_TIMEOUT_MS),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return { ok: false, error: `HTTP ${res.status} ${res.statusText}`.trim() };
    }
    return data as MailerResponse;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Asks a mailer for its remaining daily quota without sending anything. */
export async function checkMailer(webhookUrl: string, secret: string): Promise<MailerResponse> {
  return callMailer(webhookUrl, { secret, action: "quota" });
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
 * Emails an OTP code, trying each enabled sender in turn. Outside
 * production, when no sender is configured at all, returns the code so the
 * caller can surface it (console + API response) instead. Returns undefined
 * once a real email was sent; throws if every sender failed.
 */
export async function sendOtpEmail(email: string, code: string): Promise<string | undefined> {
  const senders = await getSenders();

  if (senders.length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("No mail sender is configured");
    }
    console.log(`[dev] OTP for ${email}: ${code}`);
    return code;
  }

  const failures: string[] = [];
  for (const sender of senders) {
    const result = await callMailer(sender.webhookUrl, {
      secret: sender.secret,
      to: email,
      subject: `${code} is your Hello FOSS verification code`,
      text: `Your Hello FOSS verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      html: otpEmailHtml(code),
    });

    if (result.ok) {
      if (sender.id) {
        await prisma.mailSender.update({
          where: { id: sender.id },
          data: { lastUsedAt: new Date(), lastError: null, lastErrorAt: null },
        });
      }
      return undefined;
    }

    const error = result.error ?? "Unknown error";
    failures.push(`${sender.label}: ${error}`);
    if (sender.id) {
      await prisma.mailSender.update({
        where: { id: sender.id },
        data: { lastError: error.slice(0, 500), lastErrorAt: new Date() },
      });
    }
  }

  throw new Error(`Failed to send OTP email via every sender: ${failures.join("; ")}`);
}
