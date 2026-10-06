"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AdminUserRow } from "@/lib/admin";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const selectClasses =
  "h-9 rounded-md border border-border-strong bg-background px-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function UsersTable({ users, iits }: { users: AdminUserRow[]; iits: string[] }) {
  const [query, setQuery] = useState("");
  const [iit, setIit] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.email.toLowerCase().includes(q) && !(u.name ?? "").toLowerCase().includes(q)) return false;
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
            placeholder="Search name or email"
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
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead className="bg-card">
            <tr className="border-b border-border font-mono text-xs uppercase tracking-widest text-muted-subtle">
              <th className="px-4 py-3 font-normal">User</th>
              <th className="px-4 py-3 font-normal">IIT</th>
              <th className="px-4 py-3 font-normal">Projects</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Signed up</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border align-top last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.name || "—"}</span>
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
                <td className="px-4 py-3 text-muted">{u.iit ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {u.projects.length ? u.projects.map((p) => <div key={p.slug}>{p.name}</div>) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={u.verified ? "text-accent" : "text-muted-subtle"}>
                    {u.verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{dateFormat.format(new Date(u.createdAt))}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
