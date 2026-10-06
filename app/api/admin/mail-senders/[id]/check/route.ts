import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin";
import { checkMailer } from "@/lib/email";

/** Verifies a sender's URL and secret and reports its remaining daily quota, without sending mail. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const { id } = await params;

  const sender = await prisma.mailSender.findUnique({ where: { id } });
  if (!sender) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const result = await checkMailer(sender.webhookUrl, sender.secret);
  return NextResponse.json(result);
}
