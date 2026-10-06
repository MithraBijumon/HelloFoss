"use client";

import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { checklist } from "@/data/rulebook";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "hellofoss:pr-checklist";
const listeners = new Set<() => void>();

function readChecked(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeChecked(indices: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, indices.join(","));
  } catch {
    // Storage unavailable (private mode etc.); the checklist just won't persist.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function Checklist() {
  const raw = useSyncExternalStore(subscribe, readChecked, () => "");
  const checked = new Set(raw ? raw.split(",").map(Number) : []);
  const done = checked.size;

  function toggle(i: number) {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    writeChecked([...next]);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-xs text-muted-subtle">
          {done}/{checklist.length} done
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${(done / checklist.length) * 100}%` }}
          />
        </div>
      </div>
      <ul>
        {checklist.map((item, i) => {
          const isChecked = checked.has(i);
          return (
            <li key={item} className="border-b border-border last:border-b-0">
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-card-hover">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(i)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border peer-focus-visible:outline-2 peer-focus-visible:outline-ring",
                    isChecked ? "border-accent bg-accent text-accent-foreground" : "border-border-strong"
                  )}
                  aria-hidden="true"
                >
                  {isChecked && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={cn(isChecked && "text-muted-subtle line-through")}>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
