"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AdminUserRow } from "@/lib/admin";
import { Badge } from "@/components/ui/Badge";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const selectClasses =
  "h-9 rounded-md border border-border-strong bg-background px-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

const ASSIGNABLE_ROLES = ["STUDENT", "MENTOR", "COORDINATOR", "ADMIN"] as const;

export function UsersTable({
  users: initialUsers,
  iits,
  canManageRoles = false,
  iitOptions = [],
  projects = [],
}: {
  users: AdminUserRow[];
  iits: string[];
  canManageRoles?: boolean;
  iitOptions?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [iit, setIit] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mentorFor, setMentorFor] = useState<AdminUserRow | null>(null);
  const [mentorProjectIds, setMentorProjectIds] = useState<string[]>([]);
  const [mentorIitId, setMentorIitId] = useState("");

  async function changeRole(
    id: string,
    nextRole: string,
    extra: { projectIds?: string[]; iitId?: string } = {}
  ): Promise<boolean> {
    setPendingId(id);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole, ...extra }),
    });
    const data = await res.json().catch(() => ({}));
    setPendingId(null);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return false;
    }
    setUsers(data.users);
    return true;
  }

  function handleRoleChange(u: AdminUserRow, nextRole: string) {
    if (nextRole === "MENTOR") {
      // Mentors need projects to mentor (and an IIT if the account has none), so ask first.
      setMentorFor(u);
      setMentorProjectIds([]);
      setMentorIitId("");
      setError(null);
      return;
    }
    changeRole(u.id, nextRole);
  }

  async function confirmMentor() {
    if (!mentorFor) return;
    const ok = await changeRole(mentorFor.id, "MENTOR", {
      projectIds: mentorProjectIds,
      iitId: mentorFor.iitId ?? mentorIitId,
    });
    if (ok) setMentorFor(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (
        q &&
        !u.email.toLowerCase().includes(q) &&
        !(u.name ?? "").toLowerCase().includes(q) &&
        !(u.githubUsername ?? "").includes(q)
      )
        return false;
      if (iit && u.iit !== iit) return false;
      if (role && u.role !== role) return false;
      if (status === "verified" && !u.verified) return false;
      if (status === "pending" && u.verified) return false;
      if (status === "no-project" && u.projects.length > 0) return false;
      return true;
    });
  }, [users, query, iit, role, status]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Search users</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or GitHub"
            className={cn(selectClasses, "w-full pl-8")}
          />
        </label>
        <select aria-label="Filter by IIT" value={iit} onChange={(e) => setIit(e.target.value)} className={selectClasses}>
          <option value="">All IITs</option>
          {iits.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)} className={selectClasses}>
          <option value="">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="MENTOR">Mentors</option>
          <option value="COORDINATOR">Coordinators</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClasses}>
          <option value="">Any status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending verification</option>
          <option value="no-project">No project yet</option>
        </select>
      </div>

      <p className="mt-3 font-mono text-xs text-muted-subtle">
        {filtered.length} of {users.length} users
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[50rem] border-collapse text-left text-sm">
          <thead className="bg-card">
            <tr className="border-b border-border font-mono text-xs uppercase tracking-widest text-muted-subtle">
              <th className="px-4 py-3 font-normal">User</th>
              <th className="px-4 py-3 font-normal">IIT</th>
              <th className="px-4 py-3 font-normal">GitHub</th>
              <th className="px-4 py-3 font-normal">Projects</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Signed up</th>
              {canManageRoles && <th className="px-4 py-3 font-normal">Role</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border align-top last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.name || "-"}</span>
                    {u.role !== "STUDENT" && (
                      <Badge variant="accent" className="px-1.5 py-0.5 text-[10px]">
                        {u.role}
                      </Badge>
                    )}
                  </div>
                  <a href={`mailto:${u.email}`} className="text-muted hover:text-foreground">
                    {u.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted">{u.iit ?? "-"}</td>
                <td className="px-4 py-3 text-muted">
                  {u.githubUsername ? (
                    <a
                      href={`https://github.com/${u.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground"
                    >
                      {u.githubUsername}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {u.projects.length ? u.projects.map((p) => <div key={p.slug}>{p.name}</div>) : "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={u.verified ? "text-accent" : "text-muted-subtle"}>
                    {u.verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{dateFormat.format(new Date(u.createdAt))}</td>
                {canManageRoles && (
                  <td className="px-4 py-3">
                    {u.role === "MENTOR" ? (
                      <span className="text-xs text-muted-subtle">via Mentors panel</span>
                    ) : (
                      <select
                        aria-label={`Role for ${u.email}`}
                        value={u.role}
                        disabled={pendingId === u.id}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className={cn(selectClasses, "h-8 text-xs")}
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canManageRoles ? 7 : 6} className="px-4 py-10 text-center text-muted">
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {mentorFor && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setMentorFor(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Make mentor"
            className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold">Make {mentorFor.name || mentorFor.email} a mentor</h2>

            <fieldset className="mt-4">
              <legend className="text-sm">Projects they mentor</legend>
              <div className="mt-2 flex max-h-48 flex-col gap-1.5 overflow-y-auto rounded-md border border-border p-3">
                {projects.length === 0 && <p className="text-sm text-muted">No projects yet.</p>}
                {projects.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={mentorProjectIds.includes(p.id)}
                      onChange={(e) =>
                        setMentorProjectIds((ids) =>
                          e.target.checked ? [...ids, p.id] : ids.filter((x) => x !== p.id)
                        )
                      }
                    />
                    {p.name}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-subtle">You can change this later in the Projects panel.</p>
            </fieldset>

            {!mentorFor.iitId && (
              <label className="mt-4 flex flex-col gap-1.5 text-sm">
                IIT
                <select
                  value={mentorIitId}
                  onChange={(e) => setMentorIitId(e.target.value)}
                  className={cn(selectClasses, "w-full")}
                >
                  <option value="">Choose…</option>
                  {iitOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted-subtle">
                  This account has no institute email, so we can&apos;t tell which IIT they&apos;re from. It&apos;s
                  shown on their card on the Mentors page.
                </span>
              </label>
            )}

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={pendingId === mentorFor.id}
                onClick={confirmMentor}
                className={cn(buttonBaseClasses, buttonVariantClasses.primary, "h-9 px-4 text-sm")}
              >
                {pendingId === mentorFor.id ? "Saving…" : "Make mentor"}
              </button>
              <button
                type="button"
                onClick={() => setMentorFor(null)}
                className={cn(buttonBaseClasses, buttonVariantClasses.ghost, "h-9 px-4 text-sm")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
