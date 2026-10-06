import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOtp, hasActiveOtpCooldown } from "@/lib/auth";
import { isMailConfigured, sendOtpEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  // Without a mailer the code is returned to whoever asked for it, which would
  // let anyone reset anyone's password — so resets are off until mail is set up.
  if (process.env.NODE_ENV === "production" && !isMailConfigured()) {
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable. Contact the organisers for help." },
      { status: 503 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
  }

  if (await hasActiveOtpCooldown(user.id)) {
    return NextResponse.json(
      { error: "Please wait a moment before requesting another code." },
      { status: 429 }
    );
  }

  const { code } = await createOtp(user.id);
  const devCode = await sendOtpEmail(email, code);

  return NextResponse.json({ ok: true, devCode });
}
