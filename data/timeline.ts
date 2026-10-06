import type { TimelineEvent } from "@/lib/types";

/**
 * Hello FOSS 2026 schedule. Stages with `start`/`end` mark themselves as
 * active or completed based on the viewer's date; `status` is the fallback.
 */
export const timeline: TimelineEvent[] = [
  {
    id: "onboarding",
    title: "Onboarding",
    date: "8–12 Oct",
    start: "2026-10-08",
    end: "2026-10-12",
    description:
      "Join your project, meet your mentors, attend the project walkthrough, and get the repository running locally.",
    status: "upcoming",
  },
  {
    id: "contribution-phase",
    title: "Contribution Phase",
    date: "13 Oct–12 Nov",
    start: "2026-10-13",
    end: "2026-11-12",
    description:
      "Explore issues, discuss approaches with mentors, build your solutions, and open and iterate on pull requests.",
    status: "upcoming",
  },
  {
    id: "pr-review",
    title: "PR Review",
    date: "Throughout the Contribution Phase",
    start: "2026-10-13",
    end: "2026-11-12",
    description:
      "Mentors and maintainers review contributions, provide feedback, and guide contributors through revisions and improvements.",
    status: "upcoming",
  },
  {
    id: "final-review",
    title: "Final Review & Evaluation",
    date: "13–16 Nov",
    start: "2026-11-13",
    end: "2026-11-16",
    description:
      "Address final review comments, complete pending contributions, and have mentors evaluate the work based on quality, impact, and engagement.",
    status: "upcoming",
  },
  {
    id: "results",
    title: "Results",
    date: "17 Nov onwards",
    start: "2026-11-17",
    description: "Final results and recognitions are announced across the participating IITs.",
    status: "upcoming",
  },
];
