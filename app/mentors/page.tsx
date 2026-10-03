import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { MentorsExplorer } from "@/components/mentors/MentorsExplorer";
import { mentors } from "@/data/mentors";

export const metadata: Metadata = {
  title: "Mentors",
  description:
    "Meet the project maintainers and technical guides behind Hello FOSS projects.",
};

export default function MentorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Project Maintainers + Technical Guides"
        title="Mentors"
        description="Mentors prepare repositories, create issues, maintain projects, guide contributors, review pull requests, and maintain project quality."
      />
      <Container className="py-16 sm:py-20">
        <MentorsExplorer mentors={mentors} />
      </Container>
    </>
  );
}
