/** GitHub usernames: 1-39 chars of letters, digits and single hyphens, not starting or ending with one. */
const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function normalizeGithubUsername(input: unknown): string | null {
  if (typeof input !== "string") return null;
  // Accept pasted profile URLs and @handles as well as bare usernames.
  const cleaned = input
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  return GITHUB_USERNAME.test(cleaned) ? cleaned.toLowerCase() : null;
}

/**
 * Checks the account exists on GitHub. Only a definite 404 counts as
 * "doesn't exist"; rate limits and network errors let the username through
 * so sign-up never depends on GitHub being reachable.
 */
export async function githubUserExists(username: string): Promise<boolean> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers,
      cache: "no-store",
    });
    return res.status !== 404;
  } catch {
    return true;
  }
}
