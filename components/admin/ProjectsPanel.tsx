"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import type { AdminProject } from "@/lib/admin";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";
const smallButton = cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-8 px-3 text-xs");

type Option = { id: string; name: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const emptyProject = {
  slug: "",
  name: "",
  description: "",
  longDescription: "",
  iitId: "",
  technologies: [] as string[],
  mentorIds: [] as string[],
  repositoryUrl: "",
  documentationUrl: "",
  issuesUrl: "",
  featured: false,
  published: true,
};

type FormValues = typeof emptyProject;

function ProjectForm({
  initial,
  iits,
  mentors,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: AdminProject;
  iits: Option[];
  mentors: Option[];
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial ?? emptyProject);
  const [techText, setTechText] = useState((initial?.technologies ?? []).join(", "));
  // Follow the name until the admin edits the URL name themselves.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    const technologies = techText.split(",").map((t) => t.trim()).filter(Boolean);
    setError(await onSubmit({ ...values, technologies }));
    setPending(false);
  }

  const slugChanged = initial && values.slug !== initial.slug;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Project name
          <input
            required
            value={values.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          URL name
          <input
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            onBlur={() => set("slug", slugify(values.slug))}
            className={cn(inputClasses, "font-mono")}
          />
          <span className="text-xs text-muted-subtle">
            /projects/{values.slug || "…"}
            {slugChanged && initial.registrations > 0 && " · existing registrations move with it"}
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Short description
        <input
          required
          maxLength={300}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="One or two lines shown on the project card"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Full description <span className="text-xs text-muted-subtle">(optional, shown on the project page)</span>
        <textarea
          rows={8}
          maxLength={5000}
          value={values.longDescription}
          onChange={(e) => set("longDescription", e.target.value)}
          className={inputClasses}
        />
        <span className="text-xs text-muted-subtle">
          Blank line for a new paragraph, &quot;- &quot; for bullets, *bold*, `code`, [link](https://…)
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Host IIT
          <select required value={values.iitId} onChange={(e) => set("iitId", e.target.value)} className={inputClasses}>
            <option value="" disabled>
              Choose an IIT
            </option>
            {iits.map((iit) => (
              <option key={iit.id} value={iit.id}>
                {iit.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Technologies <span className="text-xs text-muted-subtle">(comma-separated)</span>
          <input
            value={techText}
            onChange={(e) => setTechText(e.target.value)}
            placeholder="TypeScript, React, PostgreSQL"
            className={inputClasses}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["repositoryUrl", "Repository link"],
            ["issuesUrl", "Issues link"],
            ["documentationUrl", "Docs link"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            {label}
            <input
              type="url"
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder="https://github.com/…"
              className={inputClasses}
            />
          </label>
        ))}
      </div>

      {mentors.length > 0 && (
        <fieldset className="text-sm">
          <legend>Mentors</legend>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {mentors.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-muted">
                <input
                  type="checkbox"
                  checked={values.mentorIds.includes(m.id)}
                  onChange={(e) =>
                    set(
                      "mentorIds",
                      e.target.checked ? [...values.mentorIds, m.id] : values.mentorIds.filter((id) => id !== m.id)
                    )
                  }
                />
                {m.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} />
          Published (visible on the site)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured on the homepage
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={cn(buttonBaseClasses, buttonVariantClasses.primary, "h-9 px-4 text-sm")}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={cn(buttonBaseClasses, buttonVariantClasses.ghost, "h-9 px-4 text-sm")}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ProjectsPanel({
  initialProjects,
  iits,
  mentors,
}: {
  initialProjects: AdminProject[];
  iits: Option[];
  mentors: Option[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mutate(url: string, method: string, body?: unknown): Promise<string | null> {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? "Something went wrong.";
    setProjects(data.projects);
    return null;
  }

  async function act(url: string, method: string, body?: unknown) {
    setError(await mutate(url, method, body));
  }

  const iitName = (id: string) => iits.find((i) => i.id === id)?.name ?? id;

  return (
    <div className="mt-4">
      <ol className="flex flex-col gap-3">
        {projects.map((project) =>
          editingId === project.id ? (
            <li key={project.id}>
              <ProjectForm
                initial={project}
                iits={iits}
                mentors={mentors}
                submitLabel="Save changes"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  const err = await mutate(`/api/admin/projects/${project.id}`, "PATCH", values);
                  if (!err) setEditingId(null);
                  return err;
                }}
              />
            </li>
          ) : (
            <li
              key={project.id}
              className={cn("rounded-lg border border-border bg-card p-4", !project.published && "opacity-60")}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {project.name}
                    {!project.published && <span className="text-xs font-normal text-muted-subtle">(hidden)</span>}
                    {project.featured && <span className="text-xs font-normal text-accent">featured</span>}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {iitName(project.iitId)} · /projects/{project.slug} · {project.registrations}{" "}
                    {project.registrations === 1 ? "student" : "students"}
                  </p>
                  {project.technologies.length > 0 && (
                    <p className="mt-1 text-xs text-muted-subtle">{project.technologies.join(", ")}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {project.published && (
                    <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className={smallButton}>
                      View <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                  <button type="button" onClick={() => setEditingId(project.id)} className={smallButton}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => act(`/api/admin/projects/${project.id}`, "PATCH", { published: !project.published })}
                    className={smallButton}
                  >
                    {project.published ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(`/api/admin/projects/${project.id}`, "PATCH", { featured: !project.featured })}
                    className={smallButton}
                  >
                    {project.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const warning =
                        project.registrations > 0
                          ? `\n\n${project.registrations} student registration(s) for it will also be deleted. To keep them, use Hide instead.`
                          : "";
                      if (confirm(`Delete "${project.name}"?${warning}`)) {
                        act(`/api/admin/projects/${project.id}`, "DELETE");
                      }
                    }}
                    className={cn(smallButton, "text-red-500")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          )
        )}
      </ol>

      {projects.length === 0 && !adding && (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
          No projects yet. Add the first one below.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-4">
        {adding ? (
          <ProjectForm
            iits={iits}
            mentors={mentors}
            submitLabel="Add project"
            onCancel={() => setAdding(false)}
            onSubmit={async (values) => {
              const err = await mutate("/api/admin/projects", "POST", values);
              if (!err) setAdding(false);
              return err;
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-9 px-4 text-sm")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add project
          </button>
        )}
      </div>
    </div>
  );
}
