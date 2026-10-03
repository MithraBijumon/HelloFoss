import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { getIITById } from "@/data/iits";
import { getMentorById } from "@/data/mentors";
import { Badge } from "@/components/ui/Badge";
import { RegisterButton } from "@/components/projects/RegisterButton";

export function ProjectCard({ project }: { project: Project }) {
  const iit = getIITById(project.iitId);
  const mentor = project.mentorIds
    .map((id) => getMentorById(id))
    .find(Boolean);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          {iit && <p className="mt-0.5 text-sm text-muted">{iit.shortName}</p>}
        </div>
        <Badge variant={project.track === "Advanced" ? "accent" : "default"}>
          {project.track}
        </Badge>
      </div>

      <p className="text-sm leading-relaxed text-muted">{project.description}</p>

      <div className="flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      {mentor && (
        <p className="text-sm text-muted-subtle">
          Mentor: <span className="text-foreground">{mentor.name}</span>
        </p>
      )}

      <div className="mt-2 flex flex-col gap-3">
        <RegisterButton projectSlug={project.slug} />
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          View Project
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
