import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOtp, hasActiveOtpCooldown } from "@/lib/auth";
import { canSendOtp, sendOtpEmail } from "@/lib/email";
import { iits, findIITByEmail } from "@/data/iits";
import { mentors } from "@/data/mentors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!canSendOtp()) {
    return NextResponse.json(
      { error: "Registration is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.passwordHash) {
    return NextResponse.json(
      { error: "This email is already registered. Sign in instead." },
      { status: 409 }
    );
  }

  const isAdmin = adminEmails().includes(email);
  const mentor = mentors.find((m) => m.email?.toLowerCase() === email);

  let role: "STUDENT" | "MENTOR" | "ADMIN" = "STUDENT";
  let resolvedIitId: string | null = null;
  let mentorId: string | null = null;

  // The institute is derived from the email domain — there's no user-chosen IIT.
  const matchedIit = findIITByEmail(email);

  if (isAdmin) {
    role = "ADMIN";
    resolvedIitId = matchedIit?.id ?? null;
  } else if (mentor) {
    role = "MENTOR";
    mentorId = mentor.id;
    resolvedIitId = mentor.iitId;
  } else {
    if (!matchedIit) {
      const domains = iits.flatMap((iit) => iit.emailDomains).join(", ");
      return NextResponse.json(
        { error: `Use your institute email address (${domains}).` },
        { status: 400 }
      );
    }
    role = "STUDENT";
    resolvedIitId = matchedIit.id;
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role, iitId: resolvedIitId, mentorId },
    create: { email, name, role, iitId: resolvedIitId, mentorId },
  });

  if (await hasActiveOtpCooldown(user.id)) {
    return NextResponse.json(
      { error: "Please wait a moment before requesting another code." },
      { status: 429 }
    );
  }

  const { code } = await createOtp(user.id);
  let devCode: string | undefined;
  try {
    devCode = await sendOtpEmail(email, code);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "We couldn't send the verification email. Please try again in a minute." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, devCode });
}
