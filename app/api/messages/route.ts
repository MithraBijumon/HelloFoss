import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getConversationsForViewer } from "@/lib/messages";

const MAX_MESSAGE_LENGTH = 4000;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  return NextResponse.json({ conversations: await getConversationsForViewer(session) });
}

/** Starts (or continues) a DM thread with a mentor. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const mentorId = typeof body?.mentorId === "string" ? body.mentorId : "";
  const projectSlug = typeof body?.projectSlug === "string" && body.projectSlug ? body.projectSlug : null;
  const text = typeof body?.body === "string" ? body.body.trim() : "";

  if (!mentorId) {
    return NextResponse.json({ error: "Unknown mentor." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }
  if (session.mentorId === mentorId) {
    return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
  }

  const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
  if (!mentor) {
    return NextResponse.json({ error: "Unknown mentor." }, { status: 404 });
  }

  const conversation = await prisma.$transaction(async (tx) => {
    const convo = await tx.conversation.upsert({
      where: { userId_mentorId: { userId: session.id, mentorId } },
      update: { lastMessageAt: new Date() },
      create: { userId: session.id, mentorId, projectSlug },
    });
    await tx.message.create({ data: { conversationId: convo.id, senderId: session.id, body: text } });
    return convo;
  });

  return NextResponse.json({ ok: true, conversationId: conversation.id });
}
