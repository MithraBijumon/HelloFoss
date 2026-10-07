import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminProjects } from "@/lib/admin";
import { parseProjectInput, type ProjectInput } from "@/lib/project-input";

async function knownMentorIds() {
  const rows = await prisma.mentor.findMany({ select: { id: true } });
  return new Set(rows.map((m) => m.id));
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ projects: await getAdminProjects() });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let input: ProjectInput;
  try {
    input = parseProjectInput(await request.json().catch(() => null), await knownMentorIds());
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (await prisma.project.findUnique({ where: { slug: input.slug } })) {
    return NextResponse.json(
      { error: `Another project already uses the URL name "${input.slug}".` },
      { status: 409 }
    );
  }

  await prisma.project.create({ data: input });
  return NextResponse.json({ projects: await getAdminProjects() });
}
