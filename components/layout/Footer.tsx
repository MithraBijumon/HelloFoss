import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon, DiscordIcon } from "@/components/ui/SocialIcons";
import { siteConfig } from "@/data/site";

const socialLinks = [
  { key: "github", label: "GitHub", icon: GithubIcon, href: siteConfig.social.github },
  {
    key: "instagram",
    label: "Instagram",
    icon: InstagramIcon,
    href: siteConfig.social.instagram,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: LinkedinIcon,
    href: siteConfig.social.linkedin,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Terminal className="h-5 w-5 text-accent" aria-hidden="true" />
              <span>{siteConfig.name}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {siteConfig.tagline}. {siteConfig.description}
            </p>

            {siteConfig.social.discord && (
              <a
                href={siteConfig.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-3 rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/10 px-4 py-3 transition-colors hover:bg-[#5865F2]/15"
              >
                <DiscordIcon className="h-6 w-6 shrink-0 text-[#5865F2]" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    Join our Discord
                  </span>
                  <span className="block text-xs text-muted">
                    Our main channel for updates &amp; help
                  </span>
                </span>
                <ArrowUpRight
                  className="ml-2 h-4 w-4 shrink-0 text-[#5865F2]"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
                Navigate
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {siteConfig.footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
                Connect
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {socialLinks.map((social) => (
                  <li key={social.key}>
                    {social.href ? (
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
                      >
                        <social.icon className="h-4 w-4" aria-hidden="true" />
                        {social.label}
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-sm text-muted-subtle">
                        <social.icon className="h-4 w-4" aria-hidden="true" />
                        {social.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} &mdash; {siteConfig.tagline}
          </p>
          <p>Built by students, for students.</p>
        </div>
      </div>
    </footer>
  );
}
