"use client";

import { useState, type FormEvent } from "react";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/Button";
import { MentorAnnouncementList } from "@/components/mentor/MentorAnnouncementList";
import type { MentorAnnouncement } from "@/lib/mentor-announcements";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";

/** Post-to-all-mentees form plus the project's existing announcements (mentor dashboard). */
export function MentorAnnouncementsPanel({
  projectSlug,
  menteeCount,
  mentorId,
  initialAnnouncements,
}: {
  projectSlug: string;
  menteeCount: number;
  mentorId: string;
  initialAnnouncements: MentorAnnouncement[];
}) {
  const [items, setItems] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function reload() {
    const res = await fetch(`/api/projects/${projectSlug}/announcements`);
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.announcements)) setItems(data.announcements);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/mentor/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug, title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setTitle("");
      setBody("");
      await reload();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(item: MentorAnnouncement) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const res = await fetch(`/api/mentor/announcements/${item.id}`, { method: "DELETE" });
    if (res.ok) await reload();
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
      <h4 className="text-sm font-semibold">Announce to your mentees</h4>
      <p className="mt-1 text-xs text-muted-subtle">
        Visible to everyone registered on this project ({menteeCount} right now), on the project page and in Messages.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <input
          required
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          aria-label="Announcement title"
          className={inputClasses}
        />
        <textarea
          required
          rows={3}
          maxLength={5000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message to all mentees"
          aria-label="Announcement message"
          className={inputClasses}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={pending}
            className={cn(buttonBaseClasses, buttonVariantClasses.primary, "h-9 px-4 text-sm")}
          >
            {pending ? "Posting…" : "Post announcement"}
          </button>
        </div>
      </form>

      {items.length > 0 && (
        <div className="mt-4">
          <MentorAnnouncementList items={items} onDelete={(a) => a.mentorId === mentorId && handleDelete(a)} />
        </div>
      )}
    </div>
  );
}
