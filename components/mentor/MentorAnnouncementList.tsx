import { FormattedText } from "@/components/ui/FormattedText";
import type { MentorAnnouncement } from "@/lib/mentor-announcements";

const timeFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** List of mentor broadcasts; `onDelete` adds a delete button per item. */
export function MentorAnnouncementList({
  items,
  showProject = false,
  onDelete,
}: {
  items: MentorAnnouncement[];
  showProject?: boolean;
  onDelete?: (item: MentorAnnouncement) => void;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((a) => (
        <li key={a.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-subtle">
                {a.mentorName}
                {showProject && ` · ${a.projectName}`} · {timeFormat.format(new Date(a.createdAt))}
              </p>
              <h4 className="mt-1 font-semibold">{a.title}</h4>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(a)}
                className="shrink-0 text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
          <FormattedText text={a.body} className="mt-2 flex flex-col gap-3 text-sm leading-relaxed text-muted" />
        </li>
      ))}
    </ul>
  );
}
