import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAccessConversation } from "@/lib/messages";

const MAX_MESSAGE_LENGTH = 4000;
const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, iitId: true } },
      mentor: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation || !canAccessConversation(session, conversation)) return notFound();

  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: session.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const project = conversation.projectSlug
    ? await prisma.project.findUnique({ where: { slug: conversation.projectSlug }, select: { name: true } })
    : null;

  const asMentor = conversation.userId !== session.id;

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      counterpartName: asMentor ? conversation.user.name || conversation.user.email : conversation.mentor.name,
      projectName: project?.name ?? null,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        mine: m.senderId === session.id,
      })),
    },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation || !canAccessConversation(session, conversation)) return notFound();

  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });
  if (text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.message.create({ data: { conversationId: id, senderId: session.id, body: text } }),
    prisma.conversation.update({ where: { id }, data: { lastMessageAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}
