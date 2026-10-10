"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { buttonBaseClasses, buttonVariantClasses, buttonSizeClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function MessageMentorButton({
  mentorId,
  mentorName,
  projectSlug,
}: {
  mentorId: string;
  mentorName: string;
  /** Omit when there's no project in context, e.g. on the mentors directory. */
  projectSlug?: string;
}) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // A mentor can't DM themselves.
  if (user?.mentorId === mentorId) return null;

  function handleClick() {
    if (!user) {
      openAuthModal({ onSuccess: () => setOpen(true) });
      return;
    }
    setOpen(true);
    setSent(false);
    setError(null);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, projectSlug, body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSent(true);
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-subtle transition-colors hover:text-accent"
      >
        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
        Message
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Message ${mentorName}`}
            className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Message {mentorName}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {sent ? (
              <div className="mt-5 flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Your message was sent. {mentorName} will see it in their inbox.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/messages")}
                  className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
                >
                  View conversation
                </button>
              </div>
            ) : (
              <form className="mt-5 flex flex-col gap-4" onSubmit={handleSend}>
                <textarea
                  required
                  autoFocus
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  maxLength={4000}
                  placeholder={
                    projectSlug ? `Ask ${mentorName} about this project…` : `Message ${mentorName}…`
                  }
                  className="resize-none rounded-md border border-border-strong bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
                >
                  {submitting ? "Sending…" : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
