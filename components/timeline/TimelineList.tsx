"use client";

import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig = {
  completed: { icon: Check, dot: "bg-accent border-accent text-accent-foreground" },
  active: { icon: Loader2, dot: "bg-accent-soft border-accent text-accent" },
  upcoming: {
    icon: Circle,
    dot: "bg-card border-border-strong text-muted-subtle",
  },
} as const;

export function TimelineList({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative flex flex-col gap-10 pl-10 sm:pl-14">
      <div
        className="absolute top-2 bottom-2 left-[19px] w-px bg-border-strong sm:left-[27px]"
        aria-hidden="true"
      />
      {events.map((event, i) => {
        const config = statusConfig[event.status];
        const Icon = config.icon;
        return (
          <motion.li
            key={event.id}
            className="relative"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          >
            <span
              className={cn(
                "absolute top-0 left-[-40px] flex h-10 w-10 items-center justify-center rounded-full border sm:left-[-56px]",
                config.dot
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1 pt-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold">{event.title}</h3>
                <span className="font-mono text-xs uppercase tracking-wide text-muted-subtle">
                  {event.date ?? "TBA"}
                </span>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-muted">
                {event.description}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
