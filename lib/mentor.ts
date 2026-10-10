import { prisma } from "@/lib/db";
import { getSession, type SessionUser } from "@/lib/auth";
import { getIITById } from "@/data/iits";

/** Returns the signed-in user only if they're a mentor. Role is read fresh from the DB. */
export async function getMentorSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.role === "MENTOR" && session.mentorId ? session : null;
}

export type MentorProjectStudent = {
  id: string;
  name: string | null;
  email: string;
  iit: string | null;
  registeredAt: string;
};

export type MentorProject = {
  slug: string;
  name: string;
  track: string;
  published: boolean;
  students: MentorProjectStudent[];
};

/** Every project this mentor is listed on, with the students registered to it. */
export async function getMentorProjects(mentorId: string): Promise<MentorProject[]> {
  const projects = await prisma.project.findMany({
    where: { mentorIds: { has: mentorId } },
    orderBy: { createdAt: "asc" },
  });
  if (projects.length === 0) return [];

  const slugs = projects.map((p) => p.slug);
  const registrations = await prisma.registration.findMany({
    where: { projectSlug: { in: slugs } },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const studentsBySlug = new Map<string, MentorProjectStudent[]>();
  for (const r of registrations) {
    const list = studentsBySlug.get(r.projectSlug) ?? [];
    list.push({
      id: r.user.id,
      name: r.user.name,
      email: r.user.email,
      iit: r.user.iitId ? (getIITById(r.user.iitId)?.shortName ?? r.user.iitId) : null,
      registeredAt: r.createdAt.toISOString(),
    });
    studentsBySlug.set(r.projectSlug, list);
  }

  return projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    track: p.track,
    published: p.published,
    students: studentsBySlug.get(p.slug) ?? [],
  }));
}
