import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookText, ListChecks } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RegisterButton } from "@/components/projects/RegisterButton";
import { getProjectBySlug } from "@/lib/projects";
import { getIITById } from "@/data/iits";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const iit = getIITById(project.iitId);
  const mentors = project.mentors;

  return (
    <>
      <section className="bg-grid relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
        <Container className="relative py-16 sm:py-20">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge variant={project.track === "Advanced" ? "accent" : "default"}>
              {project.track}
            </Badge>
            {iit && <Badge>{iit.shortName}</Badge>}
          </div>

          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {project.name}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted">
            {project.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {project.repositoryUrl && (
              <Button href={project.repositoryUrl}>
                View Repository
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            {project.issuesUrl && (
              <Button href={project.issuesUrl} variant="secondary">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                View Issues
              </Button>
            )}
            {project.documentationUrl && (
              <Button href={project.documentationUrl} variant="secondary">
                <BookText className="h-4 w-4" aria-hidden="true" />
                Documentation
              </Button>
            )}
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          {project.longDescription && (
            <div>
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="mt-3 text-pretty leading-relaxed text-muted">
                {project.longDescription}
              </p>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold">Contributing</h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted">
              Explore the repository to understand the codebase, then browse
              open issues to find one that matches your skills. Submit a pull
              request following the project&apos;s contribution guidelines,
              and a mentor will review it and work with you until it&apos;s
              ready to merge.
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
              Participate
            </h3>
            <p className="mt-2 text-sm text-muted">
              Students can register for up to 2 projects.
            </p>
            <RegisterButton projectSlug={project.slug} className="mt-4" />
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
              Tech Stack
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {mentors.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-subtle">
                Mentor{mentors.length > 1 ? "s" : ""}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {mentors.map((mentor) => (
                  <li key={mentor.id}>
                    <Link
                      href="/mentors"
                      className="text-sm font-medium text-foreground hover:text-accent"
                    >
                      {mentor.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
