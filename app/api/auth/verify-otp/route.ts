import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyOtpAndSetPassword, createSession, setSessionCookie, MIN_PASSWORD_LENGTH } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const verified = await verifyOtpAndSetPassword(user.id, code, password);
  if (!verified) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, iitId: user.iitId },
  });
}
