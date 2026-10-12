import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, getAdminMentors, setMentorProjects } from "@/lib/admin";
import { parseMentorInput, parseProjectIds, type MentorInput } from "@/lib/mentor-input";

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

  const body = await request.json().catch(() => null);
  let input: MentorInput;
  try {
    input = parseMentorInput(body);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (input.email && (await prisma.mentor.findUnique({ where: { email: input.email } }))) {
    return NextResponse.json({ error: "Another mentor already uses that email." }, { status: 409 });
  }

  const mentor = await prisma.mentor.create({ data: input });
  await setMentorProjects(mentor.id, parseProjectIds(body));
  return NextResponse.json({ mentors: await getAdminMentors() });
}
