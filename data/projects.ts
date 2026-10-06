import type { Project } from "@/lib/types";

/**
 * No projects have been announced yet. Add entries here once repositories,
 * mentors, and issues are finalized. The UI already supports this data
 * shape end to end (preview cards, filters, and /projects/[slug] pages).
 */
const realProjects: Project[] = [];

/**
 * Fake projects shown only in `next dev`, so the explorer, filters, project
 * detail pages, and the registration workflow have something to render and
 * click through locally. Never included in a production build.
 */
const devSampleProjects: Project[] = [
  {
    id: "devtrack-cli",
    slug: "devtrack-cli",
    name: "DevTrack CLI",
    description: "A terminal-first issue tracker for small open-source teams, built as a single static binary.",
    longDescription:
      "DevTrack CLI lets maintainers triage issues, assign labels, and track PR status without leaving the terminal. Contributors will work on the sync engine, the TUI, and a plugin system for custom commands.",
    track: "Beginner",
    iitId: "iit-bombay",
    technologies: ["Go", "Cobra", "SQLite"],
    mentorIds: ["mentor-arjun-mehta"],
    repositoryUrl: "https://github.com/hello-foss-dev/devtrack-cli",
    documentationUrl: "https://github.com/hello-foss-dev/devtrack-cli/wiki",
    issuesUrl: "https://github.com/hello-foss-dev/devtrack-cli/issues",
    featured: true,
  },
  {
    id: "campus-connect",
    slug: "campus-connect",
    name: "Campus Connect",
    description: "An events and club-discovery platform for college campuses, with RSVP and reminders.",
    longDescription:
      "Campus Connect helps student clubs publish events and helps students discover them. Contributors will build out the clubs dashboard, notification preferences, and a public events calendar.",
    track: "Beginner",
    iitId: "iit-guwahati",
    technologies: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
    mentorIds: ["mentor-priya-nair"],
    repositoryUrl: "https://github.com/hello-foss-dev/campus-connect",
    documentationUrl: "https://github.com/hello-foss-dev/campus-connect/wiki",
    issuesUrl: "https://github.com/hello-foss-dev/campus-connect/issues",
    featured: true,
  },
  {
    id: "visionlab",
    slug: "visionlab",
    name: "VisionLab",
    description: "An experimentation toolkit for benchmarking lightweight computer-vision models on edge devices.",
    longDescription:
      "VisionLab wraps common CV benchmarks behind a consistent CLI and dashboard, so researchers can compare model size, latency, and accuracy trade-offs. Contributors will add new model adapters and benchmark datasets.",
    track: "Beginner",
    iitId: "iit-madras",
    technologies: ["Python", "PyTorch", "OpenCV"],
    mentorIds: ["mentor-karthik-s"],
    repositoryUrl: "https://github.com/hello-foss-dev/visionlab",
    issuesUrl: "https://github.com/hello-foss-dev/visionlab/issues",
  },
  {
    id: "dataflow-viz",
    slug: "dataflow-viz",
    name: "DataFlow Viz",
    description: "An interactive charting library for visualizing streaming data pipelines in the browser.",
    longDescription:
      "DataFlow Viz renders live pipeline graphs and metrics as data flows through them. Contributors will build new chart types, improve performance on large graphs, and write usage docs.",
    track: "Beginner",
    iitId: "iit-madras",
    technologies: ["TypeScript", "D3.js", "React"],
    mentorIds: ["mentor-karthik-s"],
    repositoryUrl: "https://github.com/hello-foss-dev/dataflow-viz",
    issuesUrl: "https://github.com/hello-foss-dev/dataflow-viz/issues",
  },
  {
    id: "eduscribe",
    slug: "eduscribe",
    name: "EduScribe",
    description: "A collaborative, accessible note-taking app built for classroom and study-group use.",
    longDescription:
      "EduScribe focuses on real-time collaboration and screen-reader-friendly editing. Contributors will work on the rich-text editor, offline sync, and accessibility audits.",
    track: "Beginner",
    iitId: "iit-patna",
    technologies: ["TypeScript", "Next.js", "Prisma"],
    mentorIds: ["mentor-ritika-singh"],
    repositoryUrl: "https://github.com/hello-foss-dev/eduscribe",
    documentationUrl: "https://github.com/hello-foss-dev/eduscribe/wiki",
    issuesUrl: "https://github.com/hello-foss-dev/eduscribe/issues",
    featured: true,
  },
];

export const projects: Project[] =
  process.env.NODE_ENV === "production" ? realProjects : [...realProjects, ...devSampleProjects];

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllTechnologies(): string[] {
  const set = new Set<string>();
  for (const p of projects) {
    for (const t of p.technologies) set.add(t);
  }
  return Array.from(set).sort();
}
