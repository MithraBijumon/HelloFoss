import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { programs } from "@/data/programs";

export const metadata: Metadata = {
  title: "Beyond Hello FOSS",
  description:
    "Open-source programmes like Hacktoberfest, Google Summer of Code, LFX Mentorship and Outreachy to take on after Hello FOSS.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Beyond Hello FOSS"
        title="Where to go next"
        description="Hello FOSS teaches you the workflow real projects expect: claiming issues, writing focused pull requests, and working with reviewers. These programmes are where you can use it next."
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="rounded-r-md border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm leading-relaxed">
            <span className="font-medium">Hacktoberfest runs in October, alongside Hello FOSS.</span>{" "}
            Pull requests only count for Hacktoberfest in repositories that take part in it, so check
            the Hacktoberfest rules and your project&apos;s README before assuming a PR counts for
            both.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {programs.map((program) => (
              <a
                key={program.id}
                href={program.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-border-strong hover:bg-card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{program.name}</h2>
                    <p className="mt-0.5 text-sm text-muted-subtle">{program.organiser}</p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-muted-subtle transition-colors group-hover:text-accent"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-accent">
                  {program.when}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{program.description}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {program.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border-strong px-2 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>

          <p className="mt-10 text-sm leading-relaxed text-muted-subtle">
            Dates and eligibility change every year, so always check each programme&apos;s official
            site before you plan around it.
          </p>
        </div>
      </Container>
    </>
  );
}
