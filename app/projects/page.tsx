import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { projects, getAllTechnologies } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse open-source projects across participating IITs. Filter by institute and technology.",
};

export default function ProjectsPage() {
  const technologies = getAllTechnologies();

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Explore Projects"
        description="Real repositories curated by mentors across participating IITs. Filter by institute or technology to find a project to contribute to."
      />
      <Container className="py-16 sm:py-20">
        <div className="mb-10 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-soft px-5 py-4">
          <Info className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm leading-relaxed text-foreground">
            Each participant may register for <strong>up to 2 projects</strong>.
            Choose the ones that best match your interests.
          </p>
        </div>
        <ProjectsExplorer projects={projects} technologies={technologies} />
      </Container>
    </>
  );
}
