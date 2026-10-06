import { prisma } from "@/lib/db";
import { getSession, type SessionUser } from "@/lib/auth";
import { getProjectBySlug } from "@/data/projects";
import { getIITById } from "@/data/iits";

/** Returns the signed-in user only if they're an admin. Role is read fresh from the DB. */
export async function getAdminSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
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
  role: "STUDENT" | "MENTOR" | "ADMIN";
  iit: string | null;
  /** False until the user finishes OTP verification and sets a password. */
  verified: boolean;
  projects: { slug: string; name: string }[];
  createdAt: string;
};

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { registrations: { orderBy: { createdAt: "asc" } } },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    iit: u.iitId ? (getIITById(u.iitId)?.shortName ?? u.iitId) : null,
    verified: u.passwordHash !== null,
    projects: u.registrations.map((r) => ({
      slug: r.projectSlug,
      // Registrations can outlive a project being removed from data/projects.ts.
      name: getProjectBySlug(r.projectSlug)?.name ?? r.projectSlug,
    })),
    createdAt: u.createdAt.toISOString(),
  }));
}
