import { getIITById } from "@/data/iits";

export type ProjectInput = {
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  iitId: string;
  technologies: string[];
  mentorIds: string[];
  repositoryUrl: string | null;
  documentationUrl: string | null;
  issuesUrl: string | null;
  featured: boolean;
  published: boolean;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalUrl(value: unknown, field: string): string | null {
  const url = str(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
  } catch {}
  throw new Error(`${field} must be a full link starting with https://`);
}

/** Validates the admin project form. Throws an Error with a user-facing message. */
export function parseProjectInput(body: unknown, knownMentorIds: Set<string>): ProjectInput {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = str(b.name);
  if (!name) throw new Error("Enter a project name.");
  if (name.length > 100) throw new Error("Keep the name under 100 characters.");

  const slug = slugify(str(b.slug) || name);
  if (!slug) throw new Error("The URL name needs at least one letter or number.");

  const description = str(b.description);
  if (!description) throw new Error("Enter a short description.");
  if (description.length > 300) throw new Error("Keep the short description under 300 characters.");

  const longDescription = str(b.longDescription) || null;
  if (longDescription && longDescription.length > 5000) {
    throw new Error("Keep the full description under 5,000 characters.");
  }

  const iitId = str(b.iitId);
  if (!getIITById(iitId)) throw new Error("Choose the host IIT.");

  const rawTech = Array.isArray(b.technologies) ? b.technologies : str(b.technologies).split(",");
  const technologies = [...new Set(rawTech.map(str).filter(Boolean))].slice(0, 20);

  const mentorIds = [...new Set((Array.isArray(b.mentorIds) ? b.mentorIds : []).map(str))].filter((id) =>
    knownMentorIds.has(id)
  );

  return {
    slug,
    name,
    description,
    longDescription,
    iitId,
    technologies,
    mentorIds,
    repositoryUrl: optionalUrl(b.repositoryUrl, "Repository link"),
    documentationUrl: optionalUrl(b.documentationUrl, "Documentation link"),
    issuesUrl: optionalUrl(b.issuesUrl, "Issues link"),
    featured: b.featured === true,
    published: b.published !== false,
  };
}
