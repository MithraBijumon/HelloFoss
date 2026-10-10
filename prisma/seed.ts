import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Dev-only sample data: a few projects (and a mentor/registration if none
 * exist yet) so there's something to click through locally. Safe to re-run —
 * everything is upserted by a stable slug/email.
 */

async function main() {
  let mentor = await prisma.mentor.findFirst({ orderBy: { createdAt: "asc" } });
  if (!mentor) {
    mentor = await prisma.mentor.create({
      data: {
        name: "Sample Mentor",
        iitId: "iit-bombay",
        bio: "Seeded for local development.",
        expertise: ["TypeScript", "React"],
        email: "sample.mentor@iitb.ac.in",
      },
    });
    console.log(`Created sample mentor "${mentor.name}" (${mentor.email})`);
  }

  const projects = [
    {
      slug: "awesome-cli-tool",
      name: "Awesome CLI Tool",
      description: "A developer-friendly command-line tool for scaffolding projects.",
      longDescription:
        "Build out subcommands, config file support, and shell completions for a CLI used by thousands of developers.",
      iitId: "iit-bombay",
      track: "Beginner",
      technologies: ["TypeScript", "Node.js"],
      mentorIds: [mentor.id],
      // A real, active public repo so the "Recent Activity" feed has
      // something to show locally. Swap for the project's actual repo.
      repositoryUrl: "https://github.com/vercel/next.js",
      issuesUrl: "https://github.com/vercel/next.js/issues",
    },
    {
      slug: "ml-research-dashboard",
      name: "ML Research Dashboard",
      description: "A dashboard for visualizing experiment results across training runs.",
      longDescription:
        "Wire up charting, run comparison, and dataset browsing on top of an existing experiment-tracking backend.",
      iitId: "iit-madras",
      track: "Advanced",
      technologies: ["Python", "React"],
      mentorIds: [mentor.id],
      repositoryUrl: "https://github.com/example/ml-research-dashboard",
      issuesUrl: "https://github.com/example/ml-research-dashboard/issues",
    },
    {
      slug: "campus-event-platform",
      name: "Campus Event Platform",
      description: "A platform for clubs to publish events and track RSVPs.",
      longDescription: "Add recurring events, waitlists, and calendar export (.ics) to the existing platform.",
      iitId: "iit-guwahati",
      track: "Beginner",
      technologies: ["Next.js", "PostgreSQL"],
      mentorIds: [] as string[],
      repositoryUrl: "https://github.com/example/campus-event-platform",
      issuesUrl: "https://github.com/example/campus-event-platform/issues",
    },
  ];

  for (const data of projects) {
    await prisma.project.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }
  console.log(`Seeded ${projects.length} projects.`);

  await prisma.announcement.upsert({
    where: { id: "seed-dm-mentors" },
    update: {},
    create: {
      id: "seed-dm-mentors",
      title: "You can now message mentors directly",
      body: "Head to a project page or the Mentors directory and hit \"Message\" to start a conversation — no more waiting on Discord replies.",
    },
  });
  console.log("Seeded 1 announcement.");

  const student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  if (student) {
    await prisma.registration.upsert({
      where: { userId_projectSlug: { userId: student.id, projectSlug: "awesome-cli-tool" } },
      update: {},
      create: { userId: student.id, projectSlug: "awesome-cli-tool" },
    });
    console.log(`Registered ${student.email} for "awesome-cli-tool".`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
