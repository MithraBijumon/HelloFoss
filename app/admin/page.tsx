import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { UsersTable } from "@/components/admin/UsersTable";
import { getAdminSession, getAdminUsers } from "@/lib/admin";
import { projects } from "@/data/projects";
import { iits } from "@/data/iits";
import { buttonBaseClasses, buttonVariantClasses, buttonSizeClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {hint && <p className="mt-2 font-mono text-xs text-muted-subtle">{hint}</p>}
    </div>
  );
}

export default async function AdminPage() {
  // Non-admins get a plain 404 so the page's existence isn't advertised.
  if (!(await getAdminSession())) notFound();

  const users = await getAdminUsers();
  const students = users.filter((u) => u.role === "STUDENT");
  const verified = students.filter((u) => u.verified);
  const withProject = students.filter((u) => u.projects.length > 0);
  const registrationCount = users.reduce((n, u) => n + u.projects.length, 0);

  // Projects from data/projects.ts, plus any slugs that only exist in registrations.
  const projectCounts = new Map<string, { name: string; track?: string; host?: string; count: number }>();
  for (const p of projects) {
    projectCounts.set(p.slug, {
      name: p.name,
      track: p.track,
      host: iits.find((i) => i.id === p.iitId)?.shortName,
      count: 0,
    });
  }
  for (const u of users) {
    for (const p of u.projects) {
      const entry = projectCounts.get(p.slug) ?? { name: p.name, count: 0 };
      entry.count += 1;
      projectCounts.set(p.slug, entry);
    }
  }
  const projectRows = [...projectCounts.entries()].sort((a, b) => b[1].count - a[1].count);

  const iitRows = iits.map((iit) => {
    const fromIit = students.filter((u) => u.iit === iit.shortName);
    return {
      name: iit.shortName,
      signups: fromIit.length,
      verified: fromIit.filter((u) => u.verified).length,
      withProject: fromIit.filter((u) => u.projects.length > 0).length,
    };
  });

  return (
    <Container className="py-12 sm:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <a
          href="/api/admin/export"
          className={cn(buttonBaseClasses, buttonVariantClasses.secondary, buttonSizeClasses.md)}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </a>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Student sign-ups" value={students.length} />
        <Stat label="Verified students" value={verified.length} hint={`${students.length - verified.length} pending`} />
        <Stat label="Students in a project" value={withProject.length} />
        <Stat label="Project registrations" value={registrationCount} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold">By project</h2>
          {projectRows.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
              No projects published yet — add them in <code className="font-mono">data/projects.ts</code>.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-card">
                  <tr className="border-b border-border font-mono text-xs uppercase tracking-widest text-muted-subtle">
                    <th className="px-4 py-3 font-normal">Project</th>
                    <th className="px-4 py-3 font-normal">Track</th>
                    <th className="px-4 py-3 text-right font-normal">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRows.map(([slug, p]) => (
                    <tr key={slug} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <span className="font-medium">{p.name}</span>
                        {p.host && <span className="block text-xs text-muted-subtle">{p.host}</span>}
                      </td>
                      <td className="px-4 py-3 text-muted">{p.track ?? "removed"}</td>
                      <td className="px-4 py-3 text-right font-mono">{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold">By IIT</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-card">
                <tr className="border-b border-border font-mono text-xs uppercase tracking-widest text-muted-subtle">
                  <th className="px-4 py-3 font-normal">IIT</th>
                  <th className="px-4 py-3 text-right font-normal">Sign-ups</th>
                  <th className="px-4 py-3 text-right font-normal">Verified</th>
                  <th className="px-4 py-3 text-right font-normal">In a project</th>
                </tr>
              </thead>
              <tbody>
                {iitRows.map((row) => (
                  <tr key={row.name} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.signups}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.verified}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.withProject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">All users</h2>
        <UsersTable users={users} iits={iits.map((i) => i.shortName)} />
      </section>
    </Container>
  );
}
