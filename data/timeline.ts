import type { TimelineEvent } from "@/lib/types";

/**
 * Dates are intentionally left unset ("TBA") until officially announced.
 * Update `date` and `status` per stage as the program progresses.
 */
export const timeline: TimelineEvent[] = [
  {
    id: "registration",
    title: "Registration",
    description:
      "Students across participating IITs sign up for Hello FOSS and choose their track.",
    status: "upcoming",
  },
  {
    id: "orientation",
    title: "Orientation",
    description:
      "An introduction to open source workflows, Git, GitHub, and how the program runs.",
    status: "upcoming",
  },
  {
    id: "project-exploration",
    title: "Project Exploration",
    description:
      "Participants explore participating repositories and get familiar with each codebase.",
    status: "upcoming",
  },
  {
    id: "issue-selection",
    title: "Issue Selection",
    description:
      "Contributors pick issues that match their track and interests, guided by mentors.",
    status: "upcoming",
  },
  {
    id: "contribution-period",
    title: "Contribution Period",
    description:
      "The core window for building, testing, and submitting pull requests against real issues.",
    status: "upcoming",
  },
  {
    id: "pr-review",
    title: "PR Review",
    description:
      "Mentors and maintainers review submitted pull requests and provide feedback.",
    status: "upcoming",
  },
  {
    id: "final-evaluation",
    title: "Final Evaluation",
    description:
      "Contributions are evaluated based on quality, impact, and engagement with the review process.",
    status: "upcoming",
  },
  {
    id: "results",
    title: "Results",
    description: "Final results and recognitions are announced to all participants.",
    status: "upcoming",
  },
];
