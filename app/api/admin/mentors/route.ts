import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminMentors } from "@/lib/admin";
import { parseMentorInput, type MentorInput } from "@/lib/mentor-input";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ mentors: await getAdminMentors() });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let input: MentorInput;
  try {
    input = parseMentorInput(await request.json().catch(() => null));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (input.email && (await prisma.mentor.findUnique({ where: { email: input.email } }))) {
    return NextResponse.json({ error: "Another mentor already uses that email." }, { status: 409 });
  }

  await prisma.mentor.create({ data: input });
  return NextResponse.json({ mentors: await getAdminMentors() });
}
