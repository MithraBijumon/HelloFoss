import Link from "next/link";
import { GitCommitHorizontal, GitPullRequest, CircleDot } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { RepoActivityItem } from "@/lib/github";

const ICONS = {
  commit: GitCommitHorizontal,
  pull_request: GitPullRequest,
  issue: CircleDot,
} as const;

type Item = RepoActivityItem & { projectName?: string; projectSlug?: string };

export function ActivityList({ items, emptyLabel = "No recent activity." }: { items: Item[]; emptyLabel?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const Icon = ICONS[item.type];
        return (
          <li key={item.id} className="flex items-start gap-3 text-sm">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-subtle" aria-hidden="true" />
            <div className="min-w-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-accent"
              >
                {item.title}
              </a>
              <p className="mt-0.5 text-xs text-muted-subtle">
                {item.projectName && item.projectSlug && (
                  <>
                    <Link href={`/projects/${item.projectSlug}`} className="hover:text-foreground">
                      {item.projectName}
                    </Link>
                    {" · "}
                  </>
                )}
                {item.author && <>{item.author} · </>}
                {item.state && <>{item.state} · </>}
                {timeAgo(item.at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
