"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Terminal } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/layout/UserMenu";
import { DiscordIcon } from "@/components/ui/SocialIcons";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Terminal className="h-5 w-5 text-accent" aria-hidden="true" />
          <span>{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {siteConfig.nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {siteConfig.social.discord && (
            <a
              href={siteConfig.social.discord}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join our Discord"
              title="Join our Discord"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#5865F2]/40 bg-[#5865F2]/10 text-[#5865F2] transition-colors hover:bg-[#5865F2]/20"
            >
              <DiscordIcon className="h-5 w-5" />
            </a>
          )}
          {user ? <UserMenu /> : <SignInButton size="md" />}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-strong md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-background md:hidden"
        >
          <nav
            className="flex flex-col gap-1 px-6 py-4"
            aria-label="Mobile"
          >
            {siteConfig.nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-base font-medium",
                    active ? "bg-card-hover text-foreground" : "text-muted"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2 px-3">
              {user ? <UserMenu fullWidth /> : <SignInButton fullWidth />}
              {siteConfig.social.discord && (
                <a
                  href={siteConfig.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#5865F2]/40 bg-[#5865F2]/10 text-sm font-medium text-[#5865F2] transition-colors hover:bg-[#5865F2]/20"
                >
                  <DiscordIcon className="h-4 w-4" />
                  Join our Discord
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
