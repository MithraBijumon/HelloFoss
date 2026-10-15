import type { AdminConversation } from "@/lib/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** Read-only view of every student/mentor conversation. */
export function MessagesOverview({ conversations }: { conversations: AdminConversation[] }) {
  if (conversations.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="mt-4 divide-y divide-border rounded-lg border border-border">
      {conversations.map((c) => (
        <details key={c.id} className="group">
          <summary className="flex cursor-pointer flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="font-medium">{c.studentName}</span>
              <span className="text-muted"> to </span>
              <span className="font-medium">{c.mentorName}</span>
              {c.projectName && <span className="block text-xs text-muted-subtle">{c.projectName}</span>}
            </span>
            <span className="font-mono text-xs text-muted-subtle">
              {c.messages.length} {c.messages.length === 1 ? "message" : "messages"} · {formatDate(c.lastMessageAt)}
            </span>
          </summary>
          <ul className="space-y-3 border-t border-border bg-card px-4 py-4">
            {c.messages.map((m) => (
              <li key={m.id} className="text-sm">
                <p className="font-mono text-xs text-muted-subtle">
                  {m.fromStudent ? c.studentName : c.mentorName} · {formatDate(m.createdAt)}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
