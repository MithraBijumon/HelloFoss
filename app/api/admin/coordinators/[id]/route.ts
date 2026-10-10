import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminCoordinators } from "@/lib/admin";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return notFound();
  const { id } = await params;

  const invite = await prisma.coordinator.findUnique({ where: { id } });
  if (!invite) return notFound();

  await prisma.coordinator.delete({ where: { id } });

  // Revoke access immediately if they'd already registered under it.
  await prisma.user.updateMany({
    where: { email: invite.email, role: "COORDINATOR" },
    data: { role: "STUDENT" },
  });

  return NextResponse.json({ coordinators: await getAdminCoordinators() });
}
