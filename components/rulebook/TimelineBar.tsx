"use client";

import { useSyncExternalStore } from "react";
import { phases } from "@/data/rulebook";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bar widths are weighted for readability, not proportional to phase length. */
const PHASE_WEIGHTS = [1, 4, 2];

function todayIso() {
  // en-CA formats as YYYY-MM-DD in the viewer's local timezone.
  return new Date().toLocaleDateString("en-CA");
}

const noopSubscribe = () => () => {};

export function TimelineBar() {
  // null on the server so the "today" marker only renders client-side,
  // avoiding a hydration mismatch.
  const today = useSyncExternalStore(noopSubscribe, todayIso, () => null);

  return (
    <div className="mt-6">
      <div className="flex gap-1">
        {phases.map((phase, i) => {
          const past = today !== null && today > phase.end;
          const current = today !== null && today >= phase.start && today <= phase.end;
          const progress = current
            ? (Date.parse(today) - Date.parse(phase.start)) /
              (Date.parse(phase.end) - Date.parse(phase.start) + DAY_MS)
            : 0;

          return (
            <div key={phase.name} className="min-w-0" style={{ flex: PHASE_WEIGHTS[i] }}>
              <div
                className={cn(
                  "relative h-2 rounded-full",
                  past ? "bg-accent/60" : current ? "bg-border-strong" : "bg-border"
                )}
              >
                {current && (
                  <>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-accent"
                      style={{ width: `${progress * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-accent"
                      style={{ left: `${progress * 100}%` }}
                    />
                  </>
                )}
              </div>
              <p
                className={cn(
                  "mt-3 font-mono text-xs",
                  current ? "text-accent" : "text-muted-subtle"
                )}
              >
                {phase.label}
                {current && <span className="hidden sm:inline"> · you are here</span>}
              </p>
              <p className="mt-1 text-sm font-semibold">{phase.name}</p>
              <p className="mt-1 hidden text-sm leading-relaxed text-muted sm:block">
                {phase.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
