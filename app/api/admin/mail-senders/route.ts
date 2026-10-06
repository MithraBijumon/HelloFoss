import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminMailSenders } from "@/lib/admin";
import { isValidWebhookUrl } from "@/lib/email";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function GET() {
  if (!(await getAdminSession())) return notFound();
  return NextResponse.json({ senders: await getAdminMailSenders() });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return notFound();

  const body = await request.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const webhookUrl = typeof body?.webhookUrl === "string" ? body.webhookUrl.trim() : "";
  const secret = typeof body?.secret === "string" ? body.secret.trim() : "";

  if (!label) {
    return NextResponse.json({ error: "Give the sender a name, e.g. the Gmail address." }, { status: 400 });
  }
  if (!isValidWebhookUrl(webhookUrl)) {
    return NextResponse.json(
      { error: "Paste the Apps Script web app URL (https://script.google.com/macros/s/…/exec)." },
      { status: 400 }
    );
  }
  if (!secret) {
    return NextResponse.json({ error: "Enter the MAIL_SECRET set in the script." }, { status: 400 });
  }

  const last = await prisma.mailSender.findFirst({ orderBy: { priority: "desc" } });
  await prisma.mailSender.create({
    data: { label, webhookUrl, secret, priority: (last?.priority ?? -1) + 1 },
  });

  return NextResponse.json({ senders: await getAdminMailSenders() });
}
