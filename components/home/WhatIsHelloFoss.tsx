import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Search,
  BookOpen,
  Hammer,
  GitPullRequest,
  Eye,
  GitMerge,
} from "lucide-react";

const flow = [
  { label: "Discover", icon: Search },
  { label: "Understand", icon: BookOpen },
  { label: "Build", icon: Hammer },
  { label: "Contribute", icon: GitPullRequest },
  { label: "Review", icon: Eye },
  { label: "Merge", icon: GitMerge },
];

export function WhatIsHelloFoss() {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="What is Hello FOSS?"
            title="From curious reader to merged contributor"
            description="Hello FOSS is a Pan-IIT open-source initiative that brings students together to work on real-world projects, collaborate with maintainers, and contribute to software used beyond the classroom. From exploring unfamiliar codebases to building features and solving real problems, Hello FOSS is a space to learn by building and become a part of the open-source community."
          />
          <div className="flex flex-col">
            {flow.map((step, i) => (
              <div key={step.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-strong bg-card">
                    <step.icon className="h-5 w-5 text-accent" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  {i < flow.length - 1 && (
                    <div className="my-1 h-8 w-px bg-border-strong" aria-hidden="true" />
                  )}
                </div>
                <div className="pt-2.5">
                  <p className="font-mono text-sm font-medium">{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
