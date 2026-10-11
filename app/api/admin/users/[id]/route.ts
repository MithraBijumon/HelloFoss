import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminUsers } from "@/lib/admin";
import { getIITById } from "@/data/iits";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

/**
 * Roles grantable from the users table. MENTOR also needs a Mentor profile,
 * so it's handled separately below; demoting a mentor goes through the
 * Mentors panel (deleting the profile).
 */
const ASSIGNABLE_ROLES = new Set(["STUDENT", "COORDINATOR", "ADMIN", "MENTOR"]);

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

  if (role === "MENTOR") {
    const projectIds: string[] = Array.isArray(body?.projectIds)
      ? body.projectIds.filter((p: unknown): p is string => typeof p === "string")
      : [];
    const projects = await prisma.project.findMany({ where: { id: { in: projectIds } } });
    if (projects.length !== new Set(projectIds).size) {
      return NextResponse.json({ error: "Unknown project." }, { status: 400 });
    }

    // Reuse the Mentor profile with this email if one exists, else create one
    // from the account so the admin can fill in the bio in the Mentors panel.
    let mentor = await prisma.mentor.findUnique({ where: { email: user.email } });
    if (!mentor) {
      const iitId = user.iitId ?? (typeof body?.iitId === "string" ? body.iitId : "");
      if (!getIITById(iitId)) {
        return NextResponse.json({ error: "Choose the mentor's IIT." }, { status: 400 });
      }
      mentor = await prisma.mentor.create({
        data: {
          name: user.name || user.email,
          iitId,
          bio: "",
          expertise: [],
          github: user.githubUsername,
          email: user.email,
        },
      });
    }
    const mentorId = mentor.id;

    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { role: "MENTOR", mentorId } }),
      ...projects
        .filter((p) => !p.mentorIds.includes(mentorId))
        .map((p) => prisma.project.update({ where: { id: p.id }, data: { mentorIds: [...p.mentorIds, mentorId] } })),
    ]);
    return NextResponse.json({ users: await getAdminUsers() });
  }

  await prisma.user.update({ where: { id }, data: { role: role as "STUDENT" | "COORDINATOR" | "ADMIN" } });
  return NextResponse.json({ users: await getAdminUsers() });
}
