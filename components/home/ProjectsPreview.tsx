import { FolderGit2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getProjects } from "@/lib/projects";

export async function ProjectsPreview() {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  const preview = featured.length > 0 ? featured : projects.slice(0, 3);

  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Projects" title="Featured Projects" />
          <Button href="/projects" variant="secondary">
            Explore All Projects
          </Button>
        </div>

        {preview.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-12"
            icon={FolderGit2}
            title="Projects coming soon"
            description="Participating repositories, mentors, and issues are being finalized. Check back soon or follow our socials for announcements."
          />
        )}
      </Container>
    </section>
  );
}
