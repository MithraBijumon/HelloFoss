"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, HelpCircle } from "lucide-react";
import type { FAQ } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${faq.id}`;

  return (
    <div className="rounded-lg border border-border bg-card">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="font-medium">{faq.question}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted transition-transform",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </h3>
      {open && (
        <div id={panelId} className="px-5 pb-4">
          <p className="text-sm leading-relaxed text-muted">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export function FAQList({ faqs }: { faqs: FAQ[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
  }, [faqs, query]);

  return (
    <div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-subtle"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions..."
          aria-label="Search FAQs"
          className="h-12 w-full rounded-md border border-border-strong bg-card pr-4 pl-11 text-sm outline-none focus-visible:border-accent"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {filtered.map((faq) => (
            <FAQItem key={faq.id} faq={faq} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={HelpCircle}
          title="No matching questions"
          description="Try a different search term."
        />
      )}
    </div>
  );
}
