import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { TimelineBar } from "@/components/rulebook/TimelineBar";
import { Checklist } from "@/components/rulebook/Checklist";
import {
  rulebook,
  keyRules,
  contributionFlow,
  pointsByLevel,
  violations,
} from "@/data/rulebook";
import type { Rule, RuleSection } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rulebook",
  description: "Rules and guidelines contributors are expected to follow during Hello FOSS.",
};

/** Same shading as the homepage contribution graph. */
const levelFill = [
  "var(--border)",
  "color-mix(in srgb, var(--accent) 30%, transparent)",
  "color-mix(in srgb, var(--accent) 55%, transparent)",
  "color-mix(in srgb, var(--accent) 78%, transparent)",
  "var(--accent)",
];

const hasProvisional = rulebook.some(
  (section) =>
    section.provisional || section.rules.some((rule) => typeof rule !== "string" && rule.provisional)
);

function TbcTag() {
  return (
    <span className="ml-1.5 inline-block rounded border border-dashed border-border-strong px-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-subtle">
      tbc
    </span>
  );
}

function RuleList({ rules }: { rules: Rule[] }) {
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {rules.map((rule, i) => {
        const text = typeof rule === "string" ? rule : rule.text;
        return (
          <li key={i} className="flex gap-3 leading-relaxed text-muted">
            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-border-strong" aria-hidden="true" />
            <span>
              {text}
              {typeof rule !== "string" && rule.provisional && <TbcTag />}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-r-md border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm font-medium leading-relaxed">
      {children}
    </p>
  );
}

function DoDont({ dos, donts }: { dos: Rule[]; donts: string[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Do</p>
        <ul className="mt-4 flex flex-col gap-3">
          {dos.map((rule, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {typeof rule === "string" ? rule : rule.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-red-500">Don&apos;t</p>
        <ul className="mt-4 flex flex-col gap-3">
          {donts.map((rule) => (
            <li key={rule} className="flex gap-2.5 text-sm leading-relaxed text-muted">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ContributionFlow() {
  return (
    <ol className="mt-6 grid gap-4 sm:grid-cols-5 sm:gap-0">
      {contributionFlow.map((item, i) => {
        const last = i === contributionFlow.length - 1;
        return (
          <li key={item.step} className="flex gap-3 sm:flex-col">
            <div className="flex items-center pt-1 sm:pt-0">
              <span
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full border-2 border-accent",
                  last ? "bg-accent" : "bg-background"
                )}
                aria-hidden="true"
              />
              {!last && <span className="hidden h-0.5 flex-1 bg-accent/40 sm:block" aria-hidden="true" />}
            </div>
            <div className="sm:pr-4">
              <p className="text-sm font-semibold">{item.step}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PointsGrid() {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pointsByLevel.map((tier) => (
          <div key={tier.label} className="rounded-lg border border-border bg-card p-4">
            <span
              className="block h-3.5 w-3.5 rounded-[3px]"
              style={{ background: levelFill[tier.level] }}
              aria-hidden="true"
            />
            <p className="mt-4 font-mono text-3xl font-semibold tracking-tight">{tier.points}</p>
            <p className="mt-1 text-sm text-muted">{tier.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs text-muted-subtle">
        base points per merged PR
      </p>
    </div>
  );
}

function ViolationsTable() {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead className="bg-card">
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-widest text-muted-subtle">
              Violation
            </th>
            <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-widest text-muted-subtle">
              First time
            </th>
            <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-widest text-muted-subtle">
              Repeated / serious
            </th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v) => (
            <tr key={v.violation} className="border-b border-border align-top last:border-b-0">
              <td className="px-4 py-3 font-medium">{v.violation}</td>
              <td className="px-4 py-3 text-muted">{v.first}</td>
              <td className="px-4 py-3 text-red-500">{v.repeated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBody({ section }: { section: RuleSection }) {
  switch (section.id) {
    case "timeline":
      return (
        <>
          <TimelineBar />
          <RuleList rules={section.rules} />
        </>
      );
    case "git-and-prs":
      return (
        <>
          <ContributionFlow />
          <DoDont dos={section.rules} donts={section.donts ?? []} />
        </>
      );
    case "evaluation":
      return (
        <>
          <PointsGrid />
          <RuleList rules={section.rules} />
        </>
      );
    case "violations":
      return <ViolationsTable />;
    case "checklist":
      return <Checklist />;
    default:
      return <RuleList rules={section.rules} />;
  }
}

export default function RulebookPage() {
  return (
    <>
      <PageHero
        eyebrow="Rulebook"
        title="Contributor Rulebook"
        description="The rules every Hello FOSS 2026 contributor follows, from first setup to final merged pull request."
      />
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[13rem_1fr] lg:gap-16">
          <nav aria-label="Contents" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
                Contents
              </p>
              <ol className="mt-4 flex flex-col gap-2.5 text-sm">
                {rulebook.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex gap-2 text-muted transition-colors hover:text-foreground"
                    >
                      <span className="font-mono text-xs leading-5 text-muted-subtle group-hover:text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="min-w-0 max-w-3xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="ml-3 font-mono text-xs text-muted-subtle">
                  tl;dr: if you read nothing else
                </span>
              </div>
              <ol className="flex flex-col gap-3 px-5 py-5 sm:px-6">
                {keyRules.map((rule, i) => (
                  <li key={rule} className="flex gap-3 leading-relaxed">
                    <span className="font-mono text-sm leading-relaxed text-accent">{i + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ol>
            </div>

            {rulebook.map((section, i) => (
              <section key={section.id} id={section.id} className="mt-16 scroll-mt-24">
                <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {section.title}
                  {section.provisional && <TbcTag />}
                </h2>
                {section.intro && (
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted">{section.intro}</p>
                )}
                {section.callout && <Callout>{section.callout}</Callout>}
                <SectionBody section={section} />
              </section>
            ))}

            {hasProvisional && (
              <p className="mt-16 border-t border-border pt-6 font-mono text-xs leading-relaxed text-muted-subtle">
                Items tagged <TbcTag /> are proposed defaults the organisers are still confirming.
              </p>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
