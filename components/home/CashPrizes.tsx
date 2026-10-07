import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iits } from "@/data/iits";
import {
  institutePrizes,
  overallBonuses,
  institutePool,
  bonusPool,
  totalPrizePool,
  formatInr,
} from "@/data/prizes";

/** 1st/2nd/3rd shading, matching the contribution-graph greens used elsewhere. */
const placeFill = [
  "var(--accent)",
  "color-mix(in srgb, var(--accent) 60%, transparent)",
  "color-mix(in srgb, var(--accent) 30%, transparent)",
];

function PrizeTile({ place, amount, index, bonus }: { place: string; amount: number; index: number; bonus?: boolean }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          className="block h-3 w-3 rounded-[3px]"
          style={{ background: placeFill[index] }}
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-subtle sm:text-xs">{place}</span>
      </div>
      <p className="mt-3 font-mono text-lg font-semibold tracking-tight sm:mt-4 sm:text-3xl">
        {bonus && "+"}
        {formatInr(amount)}
      </p>
    </div>
  );
}

export function CashPrizes() {
  const instituteNames = iits.map((i) => i.shortName);
  const instituteList = `${instituteNames.slice(0, -1).join(", ")} and ${instituteNames.at(-1)}`;

  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Cash Prizes"
            title={`${formatInr(totalPrizePool)} in cash prizes`}
            description={`${formatInr(institutePool)} across the participating IITs, plus ${formatInr(bonusPool)} in bonuses for the overall top three.`}
          />
          <Link
            href="/rulebook#evaluation"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            How scoring works
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="font-semibold">At every institute</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Awarded separately at {instituteList}.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {institutePrizes.map((prize, i) => (
                <PrizeTile key={prize.place} place={prize.place} amount={prize.amount} index={i} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Overall bonus</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              The overall top three are chosen from the institute-level winners and earn this on top of
              their institute prize.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {overallBonuses.map((prize, i) => (
                <PrizeTile key={prize.place} place={prize.place} amount={prize.amount} index={i} bonus />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
