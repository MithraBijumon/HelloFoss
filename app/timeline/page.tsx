import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { TimelineList } from "@/components/timeline/TimelineList";
import { timeline } from "@/data/timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description: "The stages of Hello FOSS 2026, from onboarding on 8 October to results in November.",
};

export default function TimelinePage() {
  return (
    <>
      <PageHero
        eyebrow="Program Timeline"
        title="Timeline"
        description="Hello FOSS 2026 runs from 8 October to mid-November. Here's how the programme is structured, stage by stage."
      />
      <Container className="py-16 sm:py-20">
        <TimelineList events={timeline} />
      </Container>
    </>
  );
}
