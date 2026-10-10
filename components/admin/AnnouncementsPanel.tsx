"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import type { AdminAnnouncement } from "@/lib/admin";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";
const smallButton = cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-8 px-3 text-xs");

const timeFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

type FormValues = { title: string; body: string; published: boolean };
const emptyAnnouncement: FormValues = { title: "", body: "", published: true };

function AnnouncementForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: AdminAnnouncement;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial ?? emptyAnnouncement);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(await onSubmit(values));
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          required
          maxLength={150}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. You can now message mentors directly"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Body
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={values.body}
          onChange={(e) => set("body", e.target.value)}
          className={inputClasses}
        />
        <span className="text-xs text-muted-subtle">
          Blank line for a new paragraph, &quot;- &quot; for bullets, *bold*, `code`, [link](https://…)
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} />
        Published (visible on /updates)
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={cn(buttonBaseClasses, buttonVariantClasses.primary, "h-9 px-4 text-sm")}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={cn(buttonBaseClasses, buttonVariantClasses.ghost, "h-9 px-4 text-sm")}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AnnouncementsPanel({ initialAnnouncements }: { initialAnnouncements: AdminAnnouncement[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mutate(url: string, method: string, body?: unknown): Promise<string | null> {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? "Something went wrong.";
    setAnnouncements(data.announcements);
    return null;
  }

  async function act(url: string, method: string, body?: unknown) {
    setError(await mutate(url, method, body));
  }

  return (
    <div className="mt-4">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Posted here, these show up on <code className="font-mono text-xs">/updates</code> so participants know what&apos;s new
        on the site.
      </p>

      <ol className="mt-4 flex flex-col gap-3">
        {announcements.map((a) =>
          editingId === a.id ? (
            <li key={a.id}>
              <AnnouncementForm
                initial={a}
                submitLabel="Save changes"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  const err = await mutate(`/api/admin/announcements/${a.id}`, "PATCH", values);
                  if (!err) setEditingId(null);
                  return err;
                }}
              />
            </li>
          ) : (
            <li key={a.id} className={cn("rounded-lg border border-border bg-card p-4", !a.published && "opacity-60")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {a.title}
                    {!a.published && <span className="text-xs font-normal text-muted-subtle">(hidden)</span>}
                  </p>
                  <p className="mt-1 text-xs text-muted-subtle">{timeFormat.format(new Date(a.createdAt))}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{a.body}</p>
                  <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={a.showAsBanner}
                      onChange={(e) => act(`/api/admin/announcements/${a.id}`, "PATCH", { showAsBanner: e.target.checked })}
                    />
                    Show as scrolling banner at the top of the site
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button type="button" onClick={() => setEditingId(a.id)} className={smallButton}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => act(`/api/admin/announcements/${a.id}`, "PATCH", { published: !a.published })}
                    className={smallButton}
                  >
                    {a.published ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${a.title}"?`)) {
                        act(`/api/admin/announcements/${a.id}`, "DELETE");
                      }
                    }}
                    className={cn(smallButton, "text-red-500")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          )
        )}
      </ol>

      {announcements.length === 0 && !adding && (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
          No announcements yet. Post the first one below.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-4">
        {adding ? (
          <AnnouncementForm
            submitLabel="Post announcement"
            onCancel={() => setAdding(false)}
            onSubmit={async (values) => {
              const err = await mutate("/api/admin/announcements", "POST", values);
              if (!err) setAdding(false);
              return err;
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-9 px-4 text-sm")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post announcement
          </button>
        )}
      </div>
    </div>
  );
}
