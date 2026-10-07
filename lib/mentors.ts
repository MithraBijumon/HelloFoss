import { connection } from "next/server";
import { prisma } from "@/lib/db";
import type { Mentor } from "@/lib/types";
import type { Mentor as MentorRow } from "@/generated/prisma/client";

/** Mentors live in the database and are managed from /admin. */

export function toMentor(row: MentorRow): Mentor {
  return {
    id: row.id,
    name: row.name,
    iitId: row.iitId,
    bio: row.bio,
    expertise: row.expertise,
    github: row.github ?? undefined,
    email: row.email ?? undefined,
  };
}

export async function getMentors(): Promise<Mentor[]> {
  await connection();
  const rows = await prisma.mentor.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toMentor);
}

/** Used at registration to grant the MENTOR role. */
export async function getMentorByEmail(email: string): Promise<Mentor | undefined> {
  const row = await prisma.mentor.findUnique({ where: { email: email.toLowerCase() } });
  return row ? toMentor(row) : undefined;
}
