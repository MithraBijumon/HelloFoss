import type { Metadata } from "next";
import {
  UserCheck,
  GitPullRequest,
  Eye,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { rulebook } from "@/data/rulebook";

export const metadata: Metadata = {
  title: "Rulebook",
  description: "Rules and guidelines contributors are expected to follow during Hello FOSS.",
};

const sectionIcons: Record<string, LucideIcon> = {
  eligibility: UserCheck,
  "contribution-guidelines": GitPullRequest,
  "review-process": Eye,
  "code-of-conduct": ShieldCheck,
  evaluation: Trophy,
};

export default function RulebookPage() {
  return (
    <>
      <PageHero
        eyebrow="Rulebook"
        title="Contributor Rulebook"
        description="The rules every contributor is expected to follow, from eligibility through final evaluation. Read this before you start contributing."
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {rulebook.map((section, i) => {
            const Icon = sectionIcons[section.id] ?? ShieldCheck;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-lg border border-border bg-card p-6 sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-strong bg-background">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    <span className="mr-2 font-mono text-sm text-muted-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.title}
                  </h2>
                </div>
                <ul className="mt-5 flex flex-col gap-3">
                  {section.rules.map((rule, j) => (
                    <li key={j} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}
