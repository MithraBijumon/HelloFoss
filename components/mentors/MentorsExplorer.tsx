"use client";

import { useMemo, useState } from "react";
import { Users2 } from "lucide-react";
import type { Mentor } from "@/lib/types";
import { iits } from "@/data/iits";
import { MentorCard } from "@/components/mentors/MentorCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export function MentorsExplorer({ mentors }: { mentors: Mentor[] }) {
  const [iit, setIit] = useState<string>("All");

  const filtered = useMemo(() => {
    if (iit === "All") return mentors;
    return mentors.filter((m) => m.iitId === iit);
  }, [mentors, iit]);

  if (mentors.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title="Mentors to be announced"
        description="Project maintainers across participating IITs are being onboarded. Check back soon."
      />
    );
  }

  const options = [
    { value: "All", label: "All" },
    ...iits.map((i) => ({ value: i.id, label: i.shortName })),
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border pb-10">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setIit(option.value)}
            aria-pressed={iit === option.value}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              iit === option.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-border-strong text-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-10"
          icon={Users2}
          title="No mentors match this filter"
          description="Try a different institute."
        />
      )}
    </div>
  );
}
