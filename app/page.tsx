import { Hero } from "@/components/home/Hero";
import { ParticipatingIITs } from "@/components/home/ParticipatingIITs";
import { WhatIsHelloFoss } from "@/components/home/WhatIsHelloFoss";
import { WhyHelloFoss } from "@/components/home/WhyHelloFoss";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CashPrizes } from "@/components/home/CashPrizes";
import { MentorsPreview } from "@/components/home/MentorsPreview";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ParticipatingIITs />
      <WhatIsHelloFoss />
      <WhyHelloFoss />
      <ProjectsPreview />
      <HowItWorks />
      <CashPrizes />
      <MentorsPreview />
      <FinalCTA />
    </>
  );
}
