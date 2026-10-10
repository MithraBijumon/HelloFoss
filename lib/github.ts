/**
 * Recent activity (commits, PRs, issues) for a project's repo, read from the
 * public GitHub REST API and cached via Next's fetch cache. No webhooks or
 * per-repo setup needed; set GITHUB_TOKEN to raise the rate limit beyond the
 * unauthenticated 60 requests/hour.
 */

const REVALIDATE_SECONDS = 600;

export type RepoActivityItem = {
  id: string;
  type: "commit" | "pull_request" | "issue";
  title: string;
  url: string;
  author: string | null;
  state?: "open" | "closed" | "merged";
  at: string;
};

function parseRepo(repositoryUrl: string): { owner: string; repo: string } | null {
  const match = repositoryUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function getJson(url: string): Promise<unknown[]> {
  try {
    const res = await fetch(url, { headers: headers(), next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

type GithubCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name?: string; date: string } | null };
  author: { login: string } | null;
};

type GithubIssueOrPull = {
  number: number;
  title: string;
  html_url: string;
  state: string;
  updated_at: string;
  merged_at?: string | null;
  user: { login: string } | null;
  pull_request?: unknown;
};

/** Recent commits, PRs, and issues for a single repo, newest first. */
export async function getRepoActivity(repositoryUrl: string, limit = 5): Promise<RepoActivityItem[]> {
  const repo = parseRepo(repositoryUrl);
  if (!repo) return [];
  const { owner, repo: name } = repo;
  const base = `https://api.github.com/repos/${owner}/${name}`;

  const [commits, pulls, issues] = await Promise.all([
    getJson(`${base}/commits?per_page=${limit}`) as Promise<GithubCommit[]>,
    getJson(`${base}/pulls?state=all&sort=updated&direction=desc&per_page=${limit}`) as Promise<GithubIssueOrPull[]>,
    getJson(`${base}/issues?state=all&sort=updated&direction=desc&per_page=${limit}`) as Promise<GithubIssueOrPull[]>,
  ]);

  const items: RepoActivityItem[] = [
    ...commits.map((c) => ({
      id: `commit-${c.sha}`,
      type: "commit" as const,
      title: c.commit.message.split("\n")[0].slice(0, 140),
      url: c.html_url,
      author: c.author?.login ?? c.commit.author?.name ?? null,
      at: c.commit.author?.date ?? new Date(0).toISOString(),
    })),
    ...pulls.map((p) => ({
      id: `pr-${p.number}`,
      type: "pull_request" as const,
      title: p.title,
      url: p.html_url,
      author: p.user?.login ?? null,
      state: (p.merged_at ? "merged" : p.state === "closed" ? "closed" : "open") as "open" | "closed" | "merged",
      at: p.updated_at,
    })),
    ...issues
      .filter((i) => !i.pull_request)
      .map((i) => ({
        id: `issue-${i.number}`,
        type: "issue" as const,
        title: i.title,
        url: i.html_url,
        author: i.user?.login ?? null,
        state: (i.state === "closed" ? "closed" : "open") as "open" | "closed",
        at: i.updated_at,
      })),
  ];

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
}

export type ProjectActivityItem = RepoActivityItem & { projectName: string; projectSlug: string };

/** Recent activity across several projects, tagged with which project it's from. */
export async function getActivityAcrossProjects(
  projects: { slug: string; name: string; repositoryUrl?: string }[],
  { perProject = 5, total = 20 }: { perProject?: number; total?: number } = {}
): Promise<ProjectActivityItem[]> {
  const withRepo = projects.filter((p): p is typeof p & { repositoryUrl: string } => Boolean(p.repositoryUrl));
  const results = await Promise.all(
    withRepo.map(async (p) => {
      const items = await getRepoActivity(p.repositoryUrl, perProject);
      return items.map((item) => ({ ...item, projectName: p.name, projectSlug: p.slug }));
    })
  );
  return results
    .flat()
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, total);
}
