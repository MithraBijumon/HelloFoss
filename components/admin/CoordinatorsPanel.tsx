"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import type { AdminCoordinator } from "@/lib/admin";
import { Badge } from "@/components/ui/Badge";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";
const smallButton = cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-8 px-3 text-xs");

function statusLabel(role: string | null) {
  if (!role) return { text: "Pending sign-up", className: "text-muted-subtle" };
  if (role === "COORDINATOR") return { text: "Active", className: "text-accent" };
  return { text: `Signed up as ${role}`, className: "text-muted-subtle" };
}

export function CoordinatorsPanel({ initialCoordinators }: { initialCoordinators: AdminCoordinator[] }) {
  const [coordinators, setCoordinators] = useState(initialCoordinators);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function mutate(url: string, method: string, body?: unknown): Promise<string | null> {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? "Something went wrong.";
    setCoordinators(data.coordinators);
    return null;
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    const err = await mutate("/api/admin/coordinators", "POST", { email, name });
    setPending(false);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setEmail("");
    setName("");
  }

  return (
    <div className="mt-4">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Invite the head of another club as a <strong>coordinator</strong>: a restricted admin who sees sign-up
        stats, the users table, and can post announcements, but has no access to Projects, Mentors, or Mail
        senders. If they&apos;ve already signed up, this applies right away; otherwise it applies the next time
        they register with this email.
      </p>

      <ol className="mt-4 flex flex-col gap-3">
        {coordinators.map((c) => {
          const status = statusLabel(c.currentRole);
          return (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  {c.name || c.email}
                  <Badge variant="accent" className="px-1.5 py-0.5 text-[10px]">
                    COORDINATOR
                  </Badge>
                </p>
                <p className="mt-0.5 text-xs text-muted-subtle">{c.email}</p>
                <p className={cn("mt-1 text-xs", status.className)}>{status.text}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Revoke coordinator access for ${c.email}?`)) {
                    setError(await mutate(`/api/admin/coordinators/${c.id}`, "DELETE"));
                  }
                }}
                className={cn(smallButton, "text-red-500")}
              >
                Revoke
              </button>
            </li>
          );
        })}
      </ol>

      {coordinators.length === 0 && (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
          No coordinators yet. Invite one below.
        </p>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="club.head@example.com"
            className={inputClasses}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Name <span className="text-xs text-muted-subtle">(optional)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonBaseClasses, buttonVariantClasses.primary, "h-9 shrink-0 px-4 text-sm")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {pending ? "Adding…" : "Add coordinator"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
