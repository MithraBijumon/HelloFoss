"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { buttonBaseClasses, buttonVariantClasses, buttonSizeClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const inputClasses =
  "h-10 rounded-md border border-border-strong bg-background px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";

/** Asks signed-in students for their GitHub username until they've added one. */
export function GithubPrompt() {
  const { user, loading, modal, refreshUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (loading || !user || user.role !== "STUDENT" || user.githubUsername || dismissed || modal.open) {
    return null;
  }
  return <GithubPromptDialog onSaved={refreshUser} onDismiss={() => setDismissed(true)} />;
}

function GithubPromptDialog({ onSaved, onDismiss }: { onSaved: () => Promise<void>; onDismiss: () => void }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      await onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add your GitHub username"
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <h2 className="font-semibold">Add your GitHub username</h2>
        <p className="mt-2 text-sm text-muted">
          We use it to credit your comments and merged pull requests to your account, and so your project mentors
          can see who has registered.
        </p>

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm">
            GitHub username
            <input
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClasses}
              placeholder="octocat"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
          >
            {submitting ? "Saving…" : "Save"}
          </button>

          <button type="button" onClick={onDismiss} className="text-sm text-muted hover:text-foreground">
            Remind me later
          </button>
        </form>
      </div>
    </div>
  );
}
