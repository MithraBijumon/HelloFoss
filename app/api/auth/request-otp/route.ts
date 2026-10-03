import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOtp, hasActiveOtpCooldown } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { getIITById, findIITByEmail } from "@/data/iits";
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
  const iitId = typeof body?.iitId === "string" ? body.iitId : "";

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

  if (isAdmin) {
    role = "ADMIN";
    resolvedIitId = getIITById(iitId) ? iitId : null;
  } else if (mentor) {
    role = "MENTOR";
    mentorId = mentor.id;
    resolvedIitId = mentor.iitId;
  } else {
    if (!getIITById(iitId)) {
      return NextResponse.json({ error: "Choose your institute." }, { status: 400 });
    }
    const matchedIit = findIITByEmail(email);
    if (!matchedIit || matchedIit.id !== iitId) {
      const chosen = getIITById(iitId);
      return NextResponse.json(
        {
          error: chosen
            ? `This email doesn't match a ${chosen.shortName} address.`
            : "This email doesn't match any participating institute.",
        },
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
  const devCode = await sendOtpEmail(email, code);

  return NextResponse.json({ ok: true, devCode });
}
