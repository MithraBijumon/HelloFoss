import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminProjects } from "@/lib/admin";
import { parseProjectInput, type ProjectInput } from "@/lib/project-input";

async function knownMentorIds() {
  const rows = await prisma.mentor.findMany({ select: { id: true } });
  return new Set(rows.map((m) => m.id));
}

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return notFound();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFound();

  const body = await request.json().catch(() => null);

  // Quick toggles from the project list send only these flags.
  if (body && !("name" in body)) {
    const data: { published?: boolean; featured?: boolean } = {};
    if (typeof body.published === "boolean") data.published = body.published;
    if (typeof body.featured === "boolean") data.featured = body.featured;
    await prisma.project.update({ where: { id }, data });
    return NextResponse.json({ projects: await getAdminProjects() });
  }

  let input: ProjectInput;
  try {
    input = parseProjectInput(body, await knownMentorIds());
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (input.slug !== project.slug) {
    if (await prisma.project.findUnique({ where: { slug: input.slug } })) {
      return NextResponse.json(
        { error: `Another project already uses the URL name "${input.slug}".` },
        { status: 409 }
      );
    }
  }

  // Registrations reference the slug, so a rename has to carry them along.
  await prisma.$transaction([
    prisma.project.update({ where: { id }, data: input }),
    ...(input.slug !== project.slug
      ? [
          prisma.registration.updateMany({
            where: { projectSlug: project.slug },
            data: { projectSlug: input.slug },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ projects: await getAdminProjects() });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return notFound();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFound();

  // Drop its registrations too, or they'd silently count toward students'
  // 2-project limit for a project they can no longer see.
  await prisma.$transaction([
    prisma.registration.deleteMany({ where: { projectSlug: project.slug } }),
    prisma.project.delete({ where: { id } }),
  ]);

  return NextResponse.json({ projects: await getAdminProjects() });
}
