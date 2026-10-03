import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { iits } from "@/data/iits";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Hello FOSS is, how it started, and how the Pan-IIT contribution workflow works.",
};

const sections = [
  {
    title: "What is Hello FOSS?",
    body: "Hello FOSS is an open-source initiative that brings students into real open-source development through curated repositories, GitHub issues, project maintainers, pull requests, and code review. It's built to teach contributors how real open-source projects actually operate — not through simulations, but through genuine codebases and genuine issues.",
  },
  {
    title: "How it started",
    body: "Hello FOSS began as an IIT Bombay initiative, built to lower the barrier to entry for students interested in open source. It paired contributors with mentors who maintained real repositories, curated beginner- and advanced-friendly issues, and guided participants through their first pull requests.",
  },
  {
    title: "Why it's expanding",
    body: "Building on that foundation, Hello FOSS is now expanding into a Pan-IIT program — bringing together students and maintainers from IIT Bombay, IIT Guwahati, IIT Madras, and IIT Patna into one shared initiative. The goal is to scale the same hands-on, mentorship-driven approach to a much wider community.",
  },
  {
    title: "What participants do",
    body: "Participants register, choose a track, explore participating projects, and select an issue to work on. They understand the existing codebase, build a solution, and submit a pull request. Throughout, mentors are available to help with questions about the project or the contribution process.",
  },
  {
    title: "What mentors do",
    body: "Mentors are project maintainers and technical guides. They prepare repositories for contribution, create and curate issues across difficulty levels, review pull requests, give feedback, and help maintain the overall quality of the project as contributions come in.",
  },
  {
    title: "How the contribution workflow works",
    body: "The workflow follows real open-source practice: discover a project, understand its codebase, build a solution to a chosen issue, contribute by opening a pull request, go through review with a mentor, and get merged once the contribution meets the project's standards.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="About Hello FOSS"
        description="A Pan-IIT open-source initiative, built around real repositories and real mentorship."
      />
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
              Participating IITs
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {iits.map((iit) => (
                <li key={iit.id} className="flex flex-col">
                  <span className="text-sm font-medium">{iit.shortName}</span>
                  <span className="text-xs text-muted">{iit.city}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </>
  );
}
