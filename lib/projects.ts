import { connection } from "next/server";
import { prisma } from "@/lib/db";
import type { Project, Track } from "@/lib/types";
import type { Project as ProjectRow } from "@/generated/prisma/client";

/**
 * Projects live in the database and are managed from /admin. Every reader
 * awaits connection() so pages that list projects render per request rather
 * than at build time (when there's no database).
 */

type MentorName = { id: string; name: string };

export function toProject(row: ProjectRow, mentorNames: MentorName[] = []): Project {
  const byId = new Map(mentorNames.map((m) => [m.id, m]));
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.longDescription ?? undefined,
    track: row.track as Track,
    iitId: row.iitId,
    technologies: row.technologies,
    mentorIds: row.mentorIds,
    // Keep the order the admin picked; skip ids of deleted mentors.
    mentors: row.mentorIds.flatMap((id) => byId.get(id) ?? []),
    repositoryUrl: row.repositoryUrl ?? undefined,
    documentationUrl: row.documentationUrl ?? undefined,
    issuesUrl: row.issuesUrl ?? undefined,
    featured: row.featured,
  };
}

/** Published projects, oldest first so the listing order is stable. */
export async function getProjects(): Promise<Project[]> {
  await connection();
  const [rows, mentors] = await Promise.all([
    prisma.project.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
    prisma.mentor.findMany({ select: { id: true, name: true } }),
  ]);
  return rows.map((row) => toProject(row, mentors));
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  await connection();
  const row = await prisma.project.findFirst({ where: { slug, published: true } });
  if (!row) return undefined;
  const mentors = await prisma.mentor.findMany({
    where: { id: { in: row.mentorIds } },
    select: { id: true, name: true },
  });
  return toProject(row, mentors);
}

export function getTechnologies(projects: Project[]): string[] {
  return [...new Set(projects.flatMap((p) => p.technologies))].sort();
}

/** mentorId -> names of the published projects they mentor. */
export function getMentorProjectNames(projects: Project[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const project of projects) {
    for (const mentorId of project.mentorIds) {
      (map[mentorId] ??= []).push(project.name);
    }
  }
  return map;
}
