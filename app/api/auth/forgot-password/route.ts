import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOtp, hasActiveOtpCooldown } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

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
