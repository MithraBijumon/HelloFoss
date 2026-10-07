"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { AdminMentor } from "@/lib/admin";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";
const smallButton = cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-8 px-3 text-xs");

type Option = { id: string; name: string };

type FormValues = {
  name: string;
  iitId: string;
  bio: string;
  expertise: string;
  github: string;
  email: string;
};

function MentorForm({
  initial,
  iits,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: AdminMentor;
  iits: Option[];
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>({
    name: initial?.name ?? "",
    iitId: initial?.iitId ?? "",
    bio: initial?.bio ?? "",
    expertise: (initial?.expertise ?? []).join(", "),
    github: initial?.github ?? "",
    email: initial?.email ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: string) {
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input required value={values.name} onChange={(e) => set("name", e.target.value)} className={inputClasses} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          IIT
          <select required value={values.iitId} onChange={(e) => set("iitId", e.target.value)} className={inputClasses}>
            <option value="" disabled>
              Choose an IIT
            </option>
            {iits.map((iit) => (
              <option key={iit.id} value={iit.id}>
                {iit.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Bio
        <textarea
          required
          rows={2}
          maxLength={500}
          value={values.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="One or two lines about them"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Expertise <span className="text-xs text-muted-subtle">(comma-separated)</span>
        <input
          value={values.expertise}
          onChange={(e) => set("expertise", e.target.value)}
          placeholder="React, Node.js, PostgreSQL"
          className={inputClasses}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          GitHub <span className="text-xs text-muted-subtle">(optional, username or profile link)</span>
          <input
            value={values.github}
            onChange={(e) => set("github", e.target.value)}
            placeholder="octocat"
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email <span className="text-xs text-muted-subtle">(optional, not shown publicly)</span>
          <input
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClasses}
          />
          <span className="text-xs text-muted-subtle">Registering with this email gives them the Mentor role.</span>
        </label>
      </div>

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

export function MentorsPanel({ mentors, iits }: { mentors: AdminMentor[]; iits: Option[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mentors come from the server; refreshing also updates the project editor's mentor list.
  async function mutate(url: string, method: string, body?: unknown): Promise<string | null> {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? "Something went wrong.";
    router.refresh();
    return null;
  }

  const iitName = (id: string) => iits.find((i) => i.id === id)?.name ?? id;

  return (
    <div className="mt-4">
      <ol className="grid gap-3 lg:grid-cols-2">
        {mentors.map((mentor) =>
          editingId === mentor.id ? (
            <li key={mentor.id} className="lg:col-span-2">
              <MentorForm
                initial={mentor}
                iits={iits}
                submitLabel="Save changes"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  const err = await mutate(`/api/admin/mentors/${mentor.id}`, "PATCH", values);
                  if (!err) setEditingId(null);
                  return err;
                }}
              />
            </li>
          ) : (
            <li key={mentor.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="font-medium">{mentor.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {iitName(mentor.iitId)}
                  {mentor.github && ` · github.com/${mentor.github}`}
                  {mentor.email && ` · ${mentor.email}`}
                </p>
                <p className="mt-1 text-xs text-muted-subtle">
                  {mentor.projects.length > 0 ? `Mentors: ${mentor.projects.join(", ")}` : "Not on any project yet"}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setEditingId(mentor.id)} className={smallButton}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const note = mentor.projects.length > 0 ? `\n\nThey'll be removed from: ${mentor.projects.join(", ")}.` : "";
                    if (confirm(`Delete mentor "${mentor.name}"?${note}`)) {
                      setError(await mutate(`/api/admin/mentors/${mentor.id}`, "DELETE"));
                    }
                  }}
                  className={cn(smallButton, "text-red-500")}
                >
                  Delete
                </button>
              </div>
            </li>
          )
        )}
      </ol>

      {mentors.length === 0 && !adding && (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
          No mentors yet. Add one, then tick them on a project to show them as its mentor.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-4">
        {adding ? (
          <MentorForm
            iits={iits}
            submitLabel="Add mentor"
            onCancel={() => setAdding(false)}
            onSubmit={async (values) => {
              const err = await mutate("/api/admin/mentors", "POST", values);
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
            Add mentor
          </button>
        )}
      </div>
    </div>
  );
}
