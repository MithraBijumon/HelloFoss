import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canViewProjectAnnouncements, getProjectMentorAnnouncements } from "@/lib/mentor-announcements";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { slug } = await params;

  if (!(await canViewProjectAnnouncements(session, slug))) {
    return NextResponse.json({ announcements: [] });
  }
  return NextResponse.json({ announcements: await getProjectMentorAnnouncements(slug) });
}
