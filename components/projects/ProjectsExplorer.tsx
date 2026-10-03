"use client";

import { useMemo, useState } from "react";
import { FolderGit2 } from "lucide-react";
import type { Project, Track } from "@/lib/types";
import { iits } from "@/data/iits";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

const tracks: ("All" | Track)[] = ["All", "Beginner", "Advanced"];

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
        {label}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              value === option.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-border-strong text-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProjectsExplorer({
  projects,
  technologies,
}: {
  projects: Project[];
  technologies: string[];
}) {
  const [track, setTrack] = useState<string>("All");
  const [iit, setIit] = useState<string>("All");
  const [tech, setTech] = useState<string>("All");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (track !== "All" && p.track !== track) return false;
      if (iit !== "All" && p.iitId !== iit) return false;
      if (tech !== "All" && !p.technologies.includes(tech)) return false;
      return true;
    });
  }, [projects, track, iit, tech]);

  return (
    <div>
      <div className="flex flex-col gap-8 border-b border-border pb-10 sm:flex-row sm:gap-12">
        <FilterGroup
          label="Track"
          value={track}
          onChange={setTrack}
          options={tracks.map((t) => ({ value: t, label: t }))}
        />
        <FilterGroup
          label="IIT"
          value={iit}
          onChange={setIit}
          options={[
            { value: "All", label: "All" },
            ...iits.map((i) => ({ value: i.id, label: i.shortName })),
          ]}
        />
        {technologies.length > 0 && (
          <FilterGroup
            label="Technology"
            value={tech}
            onChange={setTech}
            options={[
              { value: "All", label: "All" },
              ...technologies.map((t) => ({ value: t, label: t })),
            ]}
          />
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={FolderGit2}
          title="Projects coming soon"
          description="Participating repositories, mentors, and issues are being finalized. Check back soon or follow our socials for announcements."
        />
      ) : (
        <EmptyState
          className="mt-10"
          icon={FolderGit2}
          title="No projects match these filters"
          description="Try a different combination of track, IIT, or technology."
        />
      )}
    </div>
  );
}
