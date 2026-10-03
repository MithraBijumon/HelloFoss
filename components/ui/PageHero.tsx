import { Container } from "@/components/ui/Container";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-grid relative border-b border-border">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <Container className="relative py-16 sm:py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
