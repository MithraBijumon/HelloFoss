import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getProjectBySlug } from "@/lib/projects";

const MAX_PROJECTS_PER_STUDENT = 2;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "asc" },
  });

  const items = await Promise.all(
    registrations.map(async (r) => ({
      projectSlug: r.projectSlug,
      project: (await getProjectBySlug(r.projectSlug)) ?? null,
      createdAt: r.createdAt,
    }))
  );

  return NextResponse.json({ registrations: items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const projectSlug = typeof body?.projectSlug === "string" ? body.projectSlug : "";

  if (!projectSlug || !(await getProjectBySlug(projectSlug))) {
    return NextResponse.json({ error: "Unknown project." }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.registration.findUnique({
        where: { userId_projectSlug: { userId: session.id, projectSlug } },
      });
      if (existing) {
        throw new Error("ALREADY_REGISTERED");
      }

      const count = await tx.registration.count({ where: { userId: session.id } });
      if (count >= MAX_PROJECTS_PER_STUDENT) {
        throw new Error("LIMIT_REACHED");
      }

      await tx.registration.create({ data: { userId: session.id, projectSlug } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_REGISTERED") {
      return NextResponse.json({ error: "You're already registered for this project." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "LIMIT_REACHED") {
      return NextResponse.json(
        { error: `You can register for at most ${MAX_PROJECTS_PER_STUDENT} projects.` },
        { status: 409 }
      );
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const projectSlug = typeof body?.projectSlug === "string" ? body.projectSlug : "";

  if (!projectSlug) {
    return NextResponse.json({ error: "Unknown project." }, { status: 400 });
  }

  await prisma.registration.deleteMany({
    where: { userId: session.id, projectSlug },
  });

  return NextResponse.json({ ok: true });
}
