import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminMailSenders } from "@/lib/admin";
import { isValidWebhookUrl } from "@/lib/email";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return notFound();
  const { id } = await params;

  const sender = await prisma.mailSender.findUnique({ where: { id } });
  if (!sender) return notFound();

  const body = await request.json().catch(() => null);

  if (body?.move === "up" || body?.move === "down") {
    const ordered = await prisma.mailSender.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    });
    const index = ordered.findIndex((s) => s.id === id);
    const swapWith = body.move === "up" ? index - 1 : index + 1;
    if (swapWith >= 0 && swapWith < ordered.length) {
      [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];
      // Renumber everything so ties from older rows can't make a move a no-op.
      await prisma.$transaction(
        ordered.map((s, priority) => prisma.mailSender.update({ where: { id: s.id }, data: { priority } }))
      );
    }
    return NextResponse.json({ senders: await getAdminMailSenders() });
  }

  const data: { label?: string; webhookUrl?: string; secret?: string; enabled?: boolean } = {};

  if (typeof body?.label === "string") {
    if (!body.label.trim()) {
      return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
    }
    data.label = body.label.trim();
  }
  if (typeof body?.webhookUrl === "string") {
    if (!isValidWebhookUrl(body.webhookUrl.trim())) {
      return NextResponse.json(
        { error: "Paste the Apps Script web app URL (https://script.google.com/macros/s/…/exec)." },
        { status: 400 }
      );
    }
    data.webhookUrl = body.webhookUrl.trim();
  }
  // An empty secret means "keep the current one"; the form never sees it.
  if (typeof body?.secret === "string" && body.secret.trim()) {
    data.secret = body.secret.trim();
  }
  if (typeof body?.enabled === "boolean") {
    data.enabled = body.enabled;
  }

  await prisma.mailSender.update({
    where: { id },
    // Changing where or how it sends makes the old error stale.
    data: data.webhookUrl || data.secret ? { ...data, lastError: null, lastErrorAt: null } : data,
  });

  return NextResponse.json({ senders: await getAdminMailSenders() });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return notFound();
  const { id } = await params;

  await prisma.mailSender.deleteMany({ where: { id } });
  return NextResponse.json({ senders: await getAdminMailSenders() });
}
