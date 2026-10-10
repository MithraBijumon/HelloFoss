import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminCoordinators } from "@/lib/admin";
import { parseCoordinatorInput, type CoordinatorInput } from "@/lib/coordinator-input";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ coordinators: await getAdminCoordinators() });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let input: CoordinatorInput;
  try {
    input = parseCoordinatorInput(await request.json().catch(() => null));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (await prisma.coordinator.findUnique({ where: { email: input.email } })) {
    return NextResponse.json({ error: "That email is already a coordinator." }, { status: 409 });
  }

  await prisma.coordinator.create({ data: input });

  // Someone who already has an account under this email gets the role right
  // away; otherwise it applies the next time this email registers.
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing?.passwordHash && existing.role !== "ADMIN" && existing.role !== "MENTOR") {
    await prisma.user.update({ where: { id: existing.id }, data: { role: "COORDINATOR" } });
  }

  return NextResponse.json({ coordinators: await getAdminCoordinators() });
}
