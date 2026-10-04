import type { RuleSection } from "@/lib/types";

/**
 * Hello FOSS 2026 Contributor Rulebook. Rules flagged `provisional` were
 * marked [TO CONFIRM] in the source rulebook — drop the flag (or the whole
 * rule) once organisers confirm them.
 */

/** The rules people most often get wrong, shown at the top of the page. */
export const keyRules = [
  "Only work on issues a mentor has assigned to you.",
  "One issue, one branch, one PR — linked with “Closes #N”.",
  "Only merged PRs score. Quality beats PR count.",
  "Ask for help in public channels — don't DM mentors unless invited.",
  "You must be able to explain every line you submit, AI-assisted or not.",
];

/** Dates are ISO (YYYY-MM-DD), inclusive. */
export const phases = [
  {
    name: "Onboarding",
    label: "29–30 Sep",
    start: "2026-09-29",
    end: "2026-09-30",
    description: "Join your project, attend the walkthrough, get it running locally.",
  },
  {
    name: "Active phase",
    label: "1–31 Oct",
    start: "2026-10-01",
    end: "2026-10-31",
    description: "Pick issues, discuss approaches, open and iterate on PRs.",
  },
  {
    name: "Wrap-up",
    label: "1–10 Nov",
    start: "2026-11-01",
    end: "2026-11-10",
    description: "Address final review comments; mentors integrate contributions.",
  },
];

export const tracks = [
  {
    name: "Beginner",
    description: "Smaller, easier-to-navigate repositories for those new to open source.",
    maxIssues: 2,
  },
  {
    name: "Advanced",
    description: "Production-grade repositories for experienced coders.",
    maxIssues: 3,
  },
];

export const contributionFlow = [
  { step: "Get assigned", detail: "Comment on the issue, wait for a mentor" },
  { step: "Branch", detail: "One branch per issue, on your fork" },
  { step: "Open PR", detail: "Link the issue in the description" },
  { step: "Review", detail: "Address feedback on the same branch" },
  { step: "Merged", detail: "Lands upstream and scores" },
];

/** Base points per merged PR — provisional. `level` maps to contribution-graph shading. */
export const pointsByLevel = [
  { label: "Good first issue / Docs", points: 5, level: 1 },
  { label: "Beginner", points: 10, level: 2 },
  { label: "Intermediate", points: 20, level: 3 },
  { label: "Advanced", points: 40, level: 4 },
];

export const violations = [
  { violation: "Working on an unassigned issue", first: "PR closed, reminder", repeated: "Issue access restricted" },
  { violation: "Inactive on an assigned issue", first: "Issue unassigned", repeated: "Lower priority for new issues" },
  { violation: "Spam, trivial or padded PRs", first: "PRs closed, not scored", repeated: "Score deductions" },
  {
    violation: "Unreviewed or undisclosed AI-generated code",
    first: "PR closed, warning",
    repeated: "Score deductions or disqualification",
  },
  { violation: "Plagiarism or licence violation", first: "PR closed, points removed", repeated: "Disqualification" },
  { violation: "Harassment or abusive behaviour", first: "Removal from channels", repeated: "Disqualification and ban" },
];

export const checklist = [
  "Joined Discord and my project's channel",
  "Read the README and CONTRIBUTING guidelines",
  "Project runs locally and tests pass",
  "Issue is assigned to me by a mentor",
  "Approach discussed on the issue (for complex work)",
  "Working on a dedicated branch in my fork",
  "Commits are clear and focused",
  "PR links the issue and explains what, why, and how it was tested",
  "No unrelated changes",
  "Tests and docs updated where needed",
  "CI is green",
  "I can explain every line I changed",
  "All review comments addressed",
];

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
    id: "timeline-and-tracks",
    title: "Timeline and Tracks",
    rules: [
      { text: "Only PRs opened between 1 and 31 October 2026 count towards scoring.", provisional: true },
      {
        text: "PRs opened after 31 October won't be scored, but may still be reviewed during wrap-up.",
        provisional: true,
      },
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    intro:
      "Before you touch any issue, you must have the project running locally and understand how it is laid out.",
    rules: [
      "Register for the programme, join the Hello FOSS Discord server, then join your project's channel.",
      "Attend your project's onboarding session (29–30 September), or watch the recording if one exists.",
      "Read the repository's README and CONTRIBUTING guidelines end to end.",
      "Fork the repository and set up the development environment by following the README exactly.",
      "Run the project and its tests locally before claiming any issue.",
      "If setup fails, search existing issues and Discord history first. Still broken? Report it in the project channel with your OS, the command you ran, and the full error.",
    ],
    callout: "Found a gap or error in the setup instructions? Fixing it is a valid first contribution.",
  },
  {
    id: "picking-issues",
    title: "Picking and Claiming Issues",
    callout: "Don't start coding until a mentor assigns the issue to you. Unassigned PRs may be closed.",
    rules: [
      "Use labels to match your level (good first issue, beginner, intermediate, advanced) and type (bug, feature, documentation).",
      "Read the whole issue, including comments, and check nobody is assigned and no open PR already addresses it.",
      "Comment on the issue asking to be assigned, with one or two lines on how you plan to approach it.",
      {
        text: "Hold at most 2 assigned issues at a time on the Beginner track, or 3 on the Advanced track.",
        provisional: true,
      },
      {
        text: "Post a progress update at least every 5 days. Issues with no activity for 5 days may be reassigned.",
        provisional: true,
      },
      "Can't continue? Say so on the issue and unassign yourself.",
      "For architectural or advanced issues, post your proposed approach and wait for mentor feedback before implementing.",
      "Want to report a bug or propose a feature? Search for duplicates, give clear repro steps or motivation, and wait for a mentor to label and approve it first.",
    ],
  },
  {
    id: "git-and-prs",
    title: "Git, Commits and Pull Requests",
    rules: [
      "Create one descriptively named branch per issue on your fork (e.g. fix/login-redirect).",
      "Keep your branch up to date with upstream main and resolve conflicts yourself.",
      "Write commit messages that say what changed and why, following the project's convention.",
      "Link the issue in the PR description (e.g. Closes #42).",
      "Describe what you changed, why, and how you tested it. Add screenshots for UI changes.",
      "Add or update tests and docs when behaviour changes.",
      "Make sure build, linters, and tests pass locally and in CI before requesting review.",
      "Open work in progress as a draft PR.",
    ],
    donts: [
      "Commit directly to main.",
      "Bundle multiple issues into one PR.",
      "Include drive-by reformatting, dependency bumps, or out-of-scope refactors.",
      "Leave noise commits like “wip” or “fix typo” if your mentor asks you to squash.",
      "Force-push over a branch someone else is working on.",
      "Merge your own PR.",
    ],
  },
  {
    id: "review-process",
    title: "Review and Feedback",
    intro:
      "Mentors review your PR as maintainers: does it solve the issue, fit the project's conventions, handle edge cases, and include tests and docs where needed?",
    rules: [
      "Respond to every review comment, either with a change or a reasoned reply.",
      "Push fixes to the same branch — don't open a new PR for the same issue.",
      {
        text: "Reply within 3 days of a review. PRs inactive for 7 days after a review may be closed and reassigned.",
        provisional: true,
      },
      "Disagree politely and with reasons. The mentor's decision on project direction is final.",
      "Re-request review once all comments are resolved.",
      "Mentors aren't expected to reply instantly. Wait a reasonable time, then ping once.",
    ],
  },
  {
    id: "evaluation",
    title: "Scoring and Prizes",
    intro:
      "Each merged PR earns a score based on its priority, code volume, and complexity. The highest totals at the end of the programme are eligible for prizes.",
    rules: [
      {
        text: "Mentors may add up to +50% for high-priority issues or unusually complex work.",
        provisional: true,
      },
      "Only merged PRs score. Open or closed-unmerged PRs score zero.",
      "The PR must be linked to an issue that was assigned to you.",
      "Volume means meaningful change, not line count. Splitting one fix into many PRs, padding code, or trivial edits won't be scored.",
      "Mentors' scoring decisions are final; organisers handle disputes.",
      { text: "Leaderboards are tracked separately for the Beginner and Advanced tracks.", provisional: true },
    ],
  },
  {
    id: "communication",
    title: "Asking for Help",
    intro:
      "Ask in public, after you've tried yourself. Mentors aim to make you independent, so they'll point you to answers rather than hand them over.",
    rules: [
      "Project questions go in your project's Discord channel or on the GitHub issue; setup and general debugging go in the global channels.",
      "Before asking, read the README, CONTRIBUTING file, and issue comments, and search existing issues, PRs, and Discord history.",
      "When you ask, say what you're trying to do, what you tried, what happened, and what you expected.",
      "Paste errors as text in code blocks, not screenshots.",
      "Ping a mentor at most once per question, and only after a reasonable wait.",
      "Blocked by something outside your project (repo down, missing access, conduct issues)? Tell your mentor — they'll escalate.",
    ],
    callout: "Don't DM mentors for technical help unless they invite you to. Public answers help the next person.",
  },
  {
    id: "code-of-conduct",
    title: "Conduct and Integrity",
    intro: "Be respectful, do your own work, and be able to explain every line you submit.",
    rules: [
      "Treat mentors, maintainers, and fellow contributors with respect, on Discord and GitHub alike.",
      "No harassment, discrimination, insults, spam, or self-promotion.",
      "Follow each repository's own Code of Conduct, including upstream projects beyond Hello FOSS.",
      "No sniping assigned issues or copying another contributor's open PR.",
      "Submit only your own work. Copying code without credit or breaking a licence is not allowed.",
      "Respect upstream projects: follow their contribution rules and don't flood them with low-quality PRs.",
    ],
  },
  {
    id: "ai-tools",
    title: "AI Tools",
    provisional: true,
    rules: [
      "AI assistants may be used for learning and drafting, but you are responsible for every line you submit.",
      "You must understand, test, and be able to explain your changes when a mentor asks.",
      "Disclose significant AI assistance in the PR description.",
      "Bulk AI-generated PRs, unreviewed code, or AI-written review replies are not allowed.",
    ],
  },
  {
    id: "violations",
    title: "Violations and Consequences",
    provisional: true,
    intro: "Mentors report violations to the organising team, which makes the final decision.",
    rules: [],
  },
  {
    id: "checklist",
    title: "Before Every PR",
    intro: "Tick these off as you go — your progress is saved in this browser.",
    rules: [],
  },
];
