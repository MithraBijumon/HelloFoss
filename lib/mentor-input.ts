import { getIITById } from "@/data/iits";

export type MentorInput = {
  name: string;
  iitId: string;
  bio: string;
  expertise: string[];
  github: string | null;
  email: string | null;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Accepts a bare username, "@username" or a github.com profile link. */
function githubUsername(value: unknown): string | null {
  let v = str(value);
  if (!v) return null;
  v = v.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0];
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(v)) {
    throw new Error("Enter a valid GitHub username or profile link.");
  }
  return v;
}

/** Validates the admin mentor form. Throws an Error with a user-facing message. */
export function parseMentorInput(body: unknown): MentorInput {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = str(b.name);
  if (!name) throw new Error("Enter the mentor's name.");
  if (name.length > 100) throw new Error("Keep the name under 100 characters.");

  const iitId = str(b.iitId);
  if (!getIITById(iitId)) throw new Error("Choose the mentor's IIT.");

  const bio = str(b.bio);
  if (!bio) throw new Error("Add a short bio.");
  if (bio.length > 500) throw new Error("Keep the bio under 500 characters.");

  const rawExpertise = Array.isArray(b.expertise) ? b.expertise : str(b.expertise).split(",");
  const expertise = [...new Set(rawExpertise.map(str).filter(Boolean))].slice(0, 10);

  const email = str(b.email).toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

  return { name, iitId, bio, expertise, github: githubUsername(b.github), email };
}
