"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getIITById } from "@/data/iits";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function UserMenu({ fullWidth = false }: { fullWidth?: boolean }) {
  const { user, registrations, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const iit = user.iitId ? getIITById(user.iitId) : undefined;
  const firstName = (user.name || user.email).split(" ")[0];

  return (
    <div ref={rootRef} className={cn("relative", fullWidth ? "block w-full" : "inline-block")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-md border border-border-strong px-4 text-sm font-medium transition-colors hover:bg-card-hover",
          fullWidth && "w-full justify-between"
        )}
      >
        {firstName}
        {user.role !== "STUDENT" && (
          <Badge variant="accent" className="px-1.5 py-0.5 text-[10px]">
            {user.role}
          </Badge>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-border bg-card shadow-lg sm:left-0 sm:right-auto"
        >
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{user.name || user.email}</p>
              {user.role !== "STUDENT" && <Badge variant="accent">{user.role}</Badge>}
            </div>
            <p className="truncate text-xs text-muted-subtle">{user.email}</p>
            {iit && <p className="mt-1 text-xs text-muted-subtle">{iit.shortName}</p>}
            {user.role === "STUDENT" && (
              <p className="mt-1 text-xs text-muted-subtle">
                {registrations.length}/2 project{registrations.length === 1 ? "" : "s"} registered
              </p>
            )}
          </div>
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 border-b border-border px-4 py-2.5 text-left text-sm text-muted transition-colors hover:bg-card-hover hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
