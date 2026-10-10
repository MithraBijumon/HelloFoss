import { prisma } from "@/lib/db";
import { getSession, type SessionUser } from "@/lib/auth";
import { getIITById } from "@/data/iits";

/** Returns the signed-in user only if they're a full admin. Role is read fresh from the DB. */
export async function getAdminSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}

/**
 * Returns the signed-in user if they're an admin or a coordinator (e.g. the
 * head of another club). Coordinators see stats, users, and announcements,
 * but never Projects/Mentors/Mail senders — gate those with getAdminSession.
 */
export async function getDashboardSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.role === "ADMIN" || session?.role === "COORDINATOR" ? session : null;
}

export type AdminMailSender = {
  id: string;
  label: string;
  webhookUrl: string;
  /** Only the last few characters; the full secret never leaves the server. */
  secretHint: string;
  enabled: boolean;
  lastUsedAt: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
};

export async function getAdminMailSenders(): Promise<AdminMailSender[]> {
  const rows = await prisma.mailSender.findMany({
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    webhookUrl: r.webhookUrl,
    secretHint: `…${r.secret.slice(-4)}`,
    enabled: r.enabled,
    lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
    lastError: r.lastError,
    lastErrorAt: r.lastErrorAt?.toISOString() ?? null,
  }));
}

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "MENTOR" | "COORDINATOR" | "ADMIN";
  iit: string | null;
  /** False until the user finishes OTP verification and sets a password. */
  verified: boolean;
  projects: { slug: string; name: string }[];
  createdAt: string;
};

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const [users, projects] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { registrations: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.project.findMany({ select: { slug: true, name: true } }),
  ]);
  const projectNames = new Map(projects.map((p) => [p.slug, p.name]));

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    iit: u.iitId ? (getIITById(u.iitId)?.shortName ?? u.iitId) : null,
    verified: u.passwordHash !== null,
    projects: u.registrations.map((r) => ({
      slug: r.projectSlug,
      // Registrations can outlive a deleted project.
      name: projectNames.get(r.projectSlug) ?? r.projectSlug,
    })),
    createdAt: u.createdAt.toISOString(),
  }));
}

export type AdminProject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  iitId: string;
  technologies: string[];
  mentorIds: string[];
  repositoryUrl: string;
  documentationUrl: string;
  issuesUrl: string;
  featured: boolean;
  published: boolean;
  registrations: number;
};

/** Every project, published or not, with its registration count. */
export async function getAdminProjects(): Promise<AdminProject[]> {
  const [rows, counts] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.registration.groupBy({ by: ["projectSlug"], _count: { _all: true } }),
  ]);
  const countBySlug = new Map(counts.map((c) => [c.projectSlug, c._count._all]));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    longDescription: r.longDescription ?? "",
    iitId: r.iitId,
    technologies: r.technologies,
    mentorIds: r.mentorIds,
    repositoryUrl: r.repositoryUrl ?? "",
    documentationUrl: r.documentationUrl ?? "",
    issuesUrl: r.issuesUrl ?? "",
    featured: r.featured,
    published: r.published,
    registrations: countBySlug.get(r.slug) ?? 0,
  }));
}

export type AdminMentor = {
  id: string;
  name: string;
  iitId: string;
  bio: string;
  expertise: string[];
  github: string;
  email: string;
  /** Names of the projects (published or not) that list this mentor. */
  projects: string[];
};

export async function getAdminMentors(): Promise<AdminMentor[]> {
  const [rows, projects] = await Promise.all([
    prisma.mentor.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.project.findMany({ select: { name: true, mentorIds: true } }),
  ]);
  return rows.map((m) => ({
    id: m.id,
    name: m.name,
    iitId: m.iitId,
    bio: m.bio,
    expertise: m.expertise,
    github: m.github ?? "",
    email: m.email ?? "",
    projects: projects.filter((p) => p.mentorIds.includes(m.id)).map((p) => p.name),
  }));
}

export type AdminCoordinator = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  /** The matching account's current role, or null if they haven't signed up yet. */
  currentRole: string | null;
};

export async function getAdminCoordinators(): Promise<AdminCoordinator[]> {
  const rows = await prisma.coordinator.findMany({ orderBy: { createdAt: "asc" } });
  const users = await prisma.user.findMany({
    where: { email: { in: rows.map((r) => r.email) } },
    select: { email: true, role: true },
  });
  const roleByEmail = new Map(users.map((u) => [u.email, u.role]));

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    createdAt: r.createdAt.toISOString(),
    currentRole: roleByEmail.get(r.email) ?? null,
  }));
}

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  showAsBanner: boolean;
  createdAt: string;
};

export async function getAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  const rows = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    published: a.published,
    showAsBanner: a.showAsBanner,
    createdAt: a.createdAt.toISOString(),
  }));
}
