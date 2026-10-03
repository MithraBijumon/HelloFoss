import { Users2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MentorCard } from "@/components/mentors/MentorCard";
import { mentors } from "@/data/mentors";

export function MentorsPreview() {
  const preview = mentors.slice(0, 3);

  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Project Maintainers + Technical Guides"
            title="Mentors"
            description="Mentors prepare repositories, create issues, maintain projects, guide contributors, review pull requests, and maintain project quality."
          />
          <Button href="/mentors" variant="secondary" className="shrink-0">
            Meet the Mentors
          </Button>
        </div>

        {preview.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-12"
            icon={Users2}
            title="Mentors to be announced"
            description="Project maintainers across participating IITs are being onboarded. Check back soon."
          />
        )}
      </Container>
    </section>
  );
}
