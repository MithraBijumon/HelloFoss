import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDashboardSession, getAdminAnnouncements } from "@/lib/admin";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getDashboardSession())) return notFound();
  const { id } = await params;

  if (!(await prisma.announcement.findUnique({ where: { id } }))) return notFound();

  const body = await request.json().catch(() => null);
  const data: { title?: string; body?: string; published?: boolean; showAsBanner?: boolean } = {};

  if (typeof body?.title === "string") {
    if (!body.title.trim()) return NextResponse.json({ error: "Title can't be empty." }, { status: 400 });
    if (body.title.trim().length > 150) {
      return NextResponse.json({ error: "Keep the title under 150 characters." }, { status: 400 });
    }
    data.title = body.title.trim();
  }
  if (typeof body?.body === "string") {
    if (!body.body.trim()) return NextResponse.json({ error: "Body can't be empty." }, { status: 400 });
    if (body.body.trim().length > 5000) {
      return NextResponse.json({ error: "Keep the body under 5,000 characters." }, { status: 400 });
    }
    data.body = body.body.trim();
  }
  if (typeof body?.published === "boolean") {
    data.published = body.published;
  }
  if (typeof body?.showAsBanner === "boolean") {
    data.showAsBanner = body.showAsBanner;
  }

  await prisma.announcement.update({ where: { id }, data });
  return NextResponse.json({ announcements: await getAdminAnnouncements() });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getDashboardSession())) return notFound();
  const { id } = await params;

  await prisma.announcement.deleteMany({ where: { id } });
  return NextResponse.json({ announcements: await getAdminAnnouncements() });
}
