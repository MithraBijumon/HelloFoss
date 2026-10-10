"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonBaseClasses, buttonVariantClasses, buttonSizeClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ConversationListItem } from "@/lib/messages";

const POLL_MS = 8000;

type ThreadMessage = {
  id: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

type Thread = {
  id: string;
  counterpartName: string;
  projectName: string | null;
  messages: ThreadMessage[];
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MessagesPanel({
  initialConversations,
  emptyTitle = "No messages yet",
  emptyDescription = "Conversations you start will show up here.",
}: {
  initialConversations: ConversationListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    if (Array.isArray(data?.conversations)) setConversations(data.conversations);
  }, []);

  const loadThread = useCallback(async (id: string) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/messages/${id}`);
      if (!res.ok) {
        setThread(null);
        return;
      }
      const data = await res.json().catch(() => null);
      if (data?.conversation) setThread(data.conversation);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    async function run() {
      await loadThread(selectedId!);
    }
    run();
  }, [selectedId, loadThread]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshConversations();
      if (selectedId) loadThread(selectedId);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [selectedId, refreshConversations, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || sending) return;
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/messages/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDraft("");
      await Promise.all([loadThread(selectedId), refreshConversations()]);
    } finally {
      setSending(false);
    }
  }

  if (conversations.length === 0) {
    return <EmptyState icon={MessageSquare} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid overflow-hidden rounded-lg border border-border sm:grid-cols-[280px_1fr]">
      <div className="flex max-h-[32rem] flex-col overflow-y-auto border-b border-border sm:max-h-[36rem] sm:border-b-0 sm:border-r">
        {conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            className={cn(
              "flex flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-card-hover",
              selectedId === c.id && "bg-card-hover"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{c.counterpartName}</span>
              {c.unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[10px] font-semibold text-accent-foreground">
                  {c.unreadCount}
                </span>
              )}
            </div>
            {c.projectName && <span className="truncate text-xs text-muted-subtle">{c.projectName}</span>}
            <span className="truncate text-xs text-muted">{c.lastMessagePreview}</span>
          </button>
        ))}
      </div>

      <div className="flex min-h-[24rem] flex-col">
        {thread ? (
          <>
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">{thread.counterpartName}</p>
              {thread.projectName && <p className="text-xs text-muted-subtle">{thread.projectName}</p>}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-3">
                {thread.messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        m.mine ? "bg-accent text-accent-foreground" : "bg-card-hover"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          m.mine ? "text-accent-foreground/70" : "text-muted-subtle"
                        )}
                      >
                        {formatTimestamp(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border p-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Write a message…"
                className="h-10 flex-1 resize-none rounded-md border border-border-strong bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md)}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
            {error && <p className="px-3 pb-2 text-sm text-red-500">{error}</p>}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted">
            {threadLoading ? "Loading…" : "Select a conversation"}
          </div>
        )}
      </div>
    </div>
  );
}
