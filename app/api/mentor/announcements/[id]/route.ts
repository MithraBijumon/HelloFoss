import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMentorSession } from "@/lib/mentor";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMentorSession();
  if (!session?.mentorId) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { id } = await params;

  // Mentors can only remove their own posts.
  await prisma.mentorAnnouncement.deleteMany({ where: { id, mentorId: session.mentorId } });
  return NextResponse.json({ ok: true });
}
