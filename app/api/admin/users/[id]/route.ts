import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminUsers } from "@/lib/admin";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

/** Roles grantable from the users table. MENTOR stays tied to a Mentor's email instead. */
const ASSIGNABLE_ROLES = new Set(["STUDENT", "COORDINATOR", "ADMIN"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return notFound();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return notFound();
  if (user.role === "MENTOR") {
    return NextResponse.json({ error: "Mentor roles are managed via the Mentors panel." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" ? body.role : "";
  if (!ASSIGNABLE_ROLES.has(role)) {
    return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  }
  if (id === session.id && role !== "ADMIN") {
    return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { role: role as "STUDENT" | "COORDINATOR" | "ADMIN" } });
  return NextResponse.json({ users: await getAdminUsers() });
}
