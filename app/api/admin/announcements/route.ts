import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDashboardSession, getAdminAnnouncements } from "@/lib/admin";
import { parseAnnouncementInput, type AnnouncementInput } from "@/lib/announcement-input";

export async function GET() {
  if (!(await getDashboardSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ announcements: await getAdminAnnouncements() });
}

export async function POST(request: Request) {
  if (!(await getDashboardSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let input: AnnouncementInput;
  try {
    input = parseAnnouncementInput(await request.json().catch(() => null));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  await prisma.announcement.create({ data: input });
  return NextResponse.json({ announcements: await getAdminAnnouncements() });
}
