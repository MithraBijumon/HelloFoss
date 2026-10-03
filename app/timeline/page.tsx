import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { TimelineList } from "@/components/timeline/TimelineList";
import { timeline } from "@/data/timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description: "The stages of the Hello FOSS program, from registration to results.",
};

export default function TimelinePage() {
  return (
    <>
      <PageHero
        eyebrow="Program Timeline"
        title="Timeline"
        description="Dates will be announced closer to the program. Here's how the program is structured, stage by stage."
      />
      <Container className="py-16 sm:py-20">
        <TimelineList events={timeline} />
      </Container>
    </>
  );
}
