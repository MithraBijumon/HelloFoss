import type { AdminMentorAnnouncement } from "@/lib/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** Read-only list of every announcement posted by a mentor. */
export function MentorAnnouncementsOverview({ announcements }: { announcements: AdminMentorAnnouncement[] }) {
  if (announcements.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
        No mentor announcements yet.
      </p>
    );
  }

  return (
    <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
      {announcements.map((a) => (
        <li key={a.id} className="px-4 py-3 text-sm">
          <p className="font-medium">{a.title}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-subtle">
            {a.mentorName} · {a.projectName} · {formatDate(a.createdAt)}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-muted">{a.body}</p>
        </li>
      ))}
    </ul>
  );
}
