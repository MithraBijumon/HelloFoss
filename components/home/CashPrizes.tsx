import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cashPrizes } from "@/data/prizes";

export function CashPrizes() {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Cash Prizes"
            title="Top contributors get rewarded"
            description="Beyond the experience and mentorship, the best contributions across both tracks are recognized with cash prizes."
          />
          <Link
            href="/rulebook"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            Read the full rulebook
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cashPrizes.map((prize) => (
            <div
              key={prize.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
            >
              <Trophy className="h-6 w-6 text-accent" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{prize.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{prize.description}</p>
              </div>
              <p className="mt-auto font-mono text-xs uppercase tracking-widest text-muted-subtle">
                {prize.amount ?? "Amount TBA"}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
