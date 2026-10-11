import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMentorSession } from "@/lib/mentor";
import { parseAnnouncementInput } from "@/lib/announcement-input";
import { getMentorProjectSlugs } from "@/lib/mentor-announcements";

/** A mentor posts one message to every student registered on one of their projects. */
export async function POST(request: Request) {
  const session = await getMentorSession();
  if (!session?.mentorId) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const projectSlug = typeof body?.projectSlug === "string" ? body.projectSlug : "";
  if (!(await getMentorProjectSlugs(session.mentorId)).includes(projectSlug)) {
    return NextResponse.json({ error: "You're not a mentor on that project." }, { status: 403 });
  }

  let input;
  try {
    input = parseAnnouncementInput(body);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  await prisma.mentorAnnouncement.create({
    data: { mentorId: session.mentorId, projectSlug, title: input.title, body: input.body },
  });
  return NextResponse.json({ ok: true });
}
