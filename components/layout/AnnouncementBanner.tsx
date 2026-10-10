"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "hf_banner_dismissed";

export function AnnouncementBanner({ items }: { items: { id: string; title: string }[] }) {
  const dismissKey = items
    .map((i) => i.id)
    .sort()
    .join(",");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function run() {
      let wasDismissed = false;
      try {
        wasDismissed = sessionStorage.getItem(DISMISS_KEY) === dismissKey;
      } catch {
        wasDismissed = false;
      }
      setDismissed(wasDismissed);
    }
    run();
  }, [dismissKey]);

  if (items.length === 0 || dismissed) return null;

  const text = items.map((i) => i.title).join("    •    ");

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, dismissKey);
    } catch {
      // Private browsing or storage disabled; dismissal just won't persist.
    }
  }

  return (
    <div className="flex h-9 items-center gap-3 border-b border-border bg-accent-soft pl-0 pr-4">
      <div className="flex-1 overflow-hidden">
        <div className="marquee-track whitespace-nowrap text-sm font-medium text-accent">{text}</div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="shrink-0 text-accent hover:opacity-70"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
