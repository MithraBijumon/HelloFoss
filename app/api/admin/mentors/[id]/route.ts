import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminMentors } from "@/lib/admin";
import { parseMentorInput, type MentorInput } from "@/lib/mentor-input";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return notFound();
  const { id } = await params;

  if (!(await prisma.mentor.findUnique({ where: { id } }))) return notFound();

  let input: MentorInput;
  try {
    input = parseMentorInput(await request.json().catch(() => null));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (input.email) {
    const other = await prisma.mentor.findUnique({ where: { email: input.email } });
    if (other && other.id !== id) {
      return NextResponse.json({ error: "Another mentor already uses that email." }, { status: 409 });
    }
  }

  await prisma.mentor.update({ where: { id }, data: input });
  return NextResponse.json({ mentors: await getAdminMentors() });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return notFound();
  const { id } = await params;

  if (!(await prisma.mentor.findUnique({ where: { id } }))) return notFound();

  // Unlink from projects so they don't keep a dangling mentor id.
  const projects = await prisma.project.findMany({ where: { mentorIds: { has: id } } });
  await prisma.$transaction([
    ...projects.map((p) =>
      prisma.project.update({
        where: { id: p.id },
        data: { mentorIds: p.mentorIds.filter((m) => m !== id) },
      })
    ),
    prisma.mentor.delete({ where: { id } }),
  ]);

  return NextResponse.json({ mentors: await getAdminMentors() });
}
