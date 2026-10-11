import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

export type MentorAnnouncement = {
  id: string;
  projectSlug: string;
  projectName: string;
  mentorId: string;
  mentorName: string;
  title: string;
  body: string;
  createdAt: string;
};

async function load(slugs: string[]): Promise<MentorAnnouncement[]> {
  if (slugs.length === 0) return [];
  const [rows, projects] = await Promise.all([
    prisma.mentorAnnouncement.findMany({
      where: { projectSlug: { in: slugs } },
      include: { mentor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } }),
  ]);
  const names = new Map(projects.map((p) => [p.slug, p.name]));
  return rows.map((r) => ({
    id: r.id,
    projectSlug: r.projectSlug,
    projectName: names.get(r.projectSlug) ?? r.projectSlug,
    mentorId: r.mentorId,
    mentorName: r.mentor.name,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Announcements for one project, newest first. */
export function getProjectMentorAnnouncements(slug: string): Promise<MentorAnnouncement[]> {
  return load([slug]);
}

/** Announcements across every project the student is registered for. */
export async function getMentorAnnouncementsForStudent(userId: string): Promise<MentorAnnouncement[]> {
  const registrations = await prisma.registration.findMany({ where: { userId }, select: { projectSlug: true } });
  return load(registrations.map((r) => r.projectSlug));
}

/** Slugs of the projects that list this mentor. */
export async function getMentorProjectSlugs(mentorId: string): Promise<string[]> {
  const projects = await prisma.project.findMany({
    where: { mentorIds: { has: mentorId } },
    select: { slug: true },
  });
  return projects.map((p) => p.slug);
}

/** Who may read a project's announcements: its registered students, its mentors, and admins. */
export async function canViewProjectAnnouncements(session: SessionUser, slug: string): Promise<boolean> {
  if (session.role === "ADMIN") return true;
  if (session.role === "MENTOR" && session.mentorId) {
    return (await getMentorProjectSlugs(session.mentorId)).includes(slug);
  }
  const registration = await prisma.registration.findUnique({
    where: { userId_projectSlug: { userId: session.id, projectSlug: slug } },
    select: { id: true },
  });
  return Boolean(registration);
}
