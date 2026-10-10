import { connection } from "next/server";
import { prisma } from "@/lib/db";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

/** Published announcements, newest first. */
export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  await connection();
  const rows = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    createdAt: a.createdAt.toISOString(),
  }));
}

/**
 * Titles of published announcements flagged for the top-of-site banner.
 * Read in the root layout, so it deliberately skips connection() — that
 * would force every page in the site dynamic. ISR (see `revalidate` in
 * app/layout.tsx) keeps this reasonably fresh instead.
 */
export async function getBannerAnnouncements(): Promise<{ id: string; title: string }[]> {
  try {
    return await prisma.announcement.findMany({
      where: { published: true, showAsBanner: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    });
  } catch {
    // No database at build time is expected here; ISR fills this in once live.
    return [];
  }
}
