import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";
import { getIITById } from "@/data/iits";

/** True if the signed-in user is a participant in this conversation. */
export function canAccessConversation(
  viewer: SessionUser,
  conversation: { userId: string; mentorId: string }
): boolean {
  if (conversation.userId === viewer.id) return true;
  return Boolean(viewer.role === "MENTOR" && viewer.mentorId && viewer.mentorId === conversation.mentorId);
}

export type ConversationListItem = {
  id: string;
  /** The other party's display name. */
  counterpartName: string;
  counterpartSubtitle: string | null;
  projectName: string | null;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
};

/** Conversations the signed-in user is a participant in, newest first. */
export async function getConversationsForViewer(viewer: SessionUser): Promise<ConversationListItem[]> {
  const asMentor = viewer.role === "MENTOR" && Boolean(viewer.mentorId);

  const conversations = await prisma.conversation.findMany({
    where: asMentor ? { mentorId: viewer.mentorId! } : { userId: viewer.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, iitId: true } },
      mentor: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (conversations.length === 0) return [];

  const slugs = [...new Set(conversations.flatMap((c) => (c.projectSlug ? [c.projectSlug] : [])))];
  const projects = slugs.length
    ? await prisma.project.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } })
    : [];
  const projectNames = new Map(projects.map((p) => [p.slug, p.name]));

  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderId: { not: viewer.id },
      readAt: null,
    },
    _count: { _all: true },
  });
  const unreadByConversation = new Map(unreadCounts.map((u) => [u.conversationId, u._count._all]));

  return conversations.map((c) => {
    const last = c.messages[0];
    return {
      id: c.id,
      counterpartName: asMentor ? (c.user.name || c.user.email) : c.mentor.name,
      counterpartSubtitle: asMentor
        ? c.user.iitId
          ? (getIITById(c.user.iitId)?.shortName ?? c.user.iitId)
          : null
        : "Mentor",
      projectName: c.projectSlug ? (projectNames.get(c.projectSlug) ?? c.projectSlug) : null,
      lastMessageAt: c.lastMessageAt.toISOString(),
      lastMessagePreview: last?.body ?? "",
      unreadCount: unreadByConversation.get(c.id) ?? 0,
    };
  });
}
