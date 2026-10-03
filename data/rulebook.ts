import type { RuleSection } from "@/lib/types";

/**
 * Draft rules for the contribution period. Review and adjust before the
 * program goes live — these are what contributors will be held to.
 */
export const rulebook: RuleSection[] = [
  {
    id: "eligibility",
    title: "Eligibility",
    rules: [
      "Open to currently enrolled students at a participating IIT.",
      "Register with your official institute email address — it's used to verify eligibility.",
      "Each student may register for at most 2 projects at a time.",
    ],
  },
  {
    id: "contribution-guidelines",
    title: "Contribution Guidelines",
    rules: [
      "All work must be original. Plagiarized or unreviewed AI-generated submissions will be disqualified.",
      "Pick issues labeled for your track — mentors can help you find a good first issue.",
      "Open a pull request for every contribution and link it to the issue it resolves.",
      "Keep pull requests focused and reasonably small so mentors can review them quickly.",
    ],
  },
  {
    id: "review-process",
    title: "Review Process",
    rules: [
      "Every pull request is reviewed by a project mentor before it's merged.",
      "Respond to review feedback within the contribution window — stale PRs may be closed.",
      "Only merged pull requests count toward evaluation.",
    ],
  },
  {
    id: "code-of-conduct",
    title: "Code of Conduct",
    rules: [
      "Be respectful in all interactions — on GitHub, on Discord, and in person.",
      "Harassment, plagiarism, or attempts to game the evaluation process result in disqualification.",
      "When in doubt about what's allowed, ask a mentor or organizer first.",
    ],
  },
  {
    id: "evaluation",
    title: "Evaluation & Prizes",
    rules: [
      "Contributions are evaluated on code quality, complexity, and impact — not just PR count.",
      "Mentors and maintainers score merged pull requests at the end of the contribution period.",
      "Final results and prizes are announced after the review period closes.",
    ],
  },
];
