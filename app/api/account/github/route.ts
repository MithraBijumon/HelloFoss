import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { githubUserExists, normalizeGithubUsername } from "@/lib/github-username";

const TAKEN = "That GitHub username is already linked to another account.";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const username = normalizeGithubUsername(body?.username);
  if (!username) {
    return NextResponse.json({ error: "Enter a valid GitHub username." }, { status: 400 });
  }

  if (!(await githubUserExists(username))) {
    return NextResponse.json({ error: "We couldn't find that account on GitHub." }, { status: 400 });
  }

  const taken = await prisma.user.findFirst({
    where: { githubUsername: username, id: { not: session.id } },
    select: { id: true },
  });
  if (taken) return NextResponse.json({ error: TAKEN }, { status: 409 });

  try {
    await prisma.user.update({ where: { id: session.id }, data: { githubUsername: username } });
  } catch (error) {
    // Lost a race with another account claiming the same username.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: TAKEN }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true, githubUsername: username });
}
