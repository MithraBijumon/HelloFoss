import { Container } from "@/components/ui/Container";
import { RegisterMenu } from "@/components/layout/RegisterMenu";
import { DiscordIcon } from "@/components/ui/SocialIcons";
import { siteConfig } from "@/data/site";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="bg-grid relative overflow-hidden rounded-xl border border-border px-6 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to Contribute?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted">
              Join students across IITs and start your open-source journey.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <RegisterMenu size="lg" label="Register for Hello FOSS" />
              {siteConfig.social.discord && (
                <a
                  href={siteConfig.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#5865F2]/40 bg-[#5865F2] px-6 text-base font-medium text-white transition-colors hover:bg-[#4752C4]"
                >
                  <DiscordIcon className="h-4 w-4" aria-hidden="true" />
                  Join our Discord
                </a>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
