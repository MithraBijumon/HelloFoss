import { UserRound } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import type { Mentor } from "@/lib/types";
import { getIITById } from "@/data/iits";
import { projects } from "@/data/projects";

export function MentorCard({ mentor }: { mentor: Mentor }) {
  const iit = getIITById(mentor.iitId);
  const mentorProjects = projects.filter((p) => mentor.projectIds.includes(p.id));

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-strong bg-background">
          <UserRound className="h-6 w-6 text-muted" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold">{mentor.name}</h3>
          {iit && <p className="text-sm text-muted">{iit.shortName}</p>}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted">{mentor.bio}</p>

      {mentorProjects.length > 0 && (
        <p className="text-sm text-muted-subtle">
          Project: <span className="text-foreground">{mentorProjects[0].name}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {mentor.expertise.map((skill) => (
          <span
            key={skill}
            className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted"
          >
            {skill}
          </span>
        ))}
      </div>

      {mentor.github && (
        <a
          href={mentor.github}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <GithubIcon className="h-4 w-4" aria-hidden="true" />
          GitHub Profile
        </a>
      )}
    </div>
  );
}
