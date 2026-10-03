import type { Mentor } from "@/lib/types";

/**
 * No mentors have been confirmed yet. Add entries here once project
 * maintainers are onboarded — the mentor directory and project pages
 * already support this data shape.
 */
const realMentors: Mentor[] = [];

/**
 * Fake mentors shown only in `next dev`, so the mentor directory,
 * project pages, and the MENTOR auth path have something to render against
 * locally. Never included in a production build. `email` lets you sign in
 * locally as a mentor via the OTP flow using that exact address.
 */
const devSampleMentors: Mentor[] = [
  {
    id: "mentor-arjun-mehta",
    name: "Arjun Mehta",
    iitId: "iit-bombay",
    projectIds: ["devtrack-cli"],
    expertise: ["Go", "CLI Tools", "Distributed Systems"],
    github: "arjunmehta",
    email: "arjun.mentor@iitb.ac.in",
    bio: "Maintainer of a handful of Go developer-tooling projects. Enjoys pairing with first-time contributors on their first PR.",
  },
  {
    id: "mentor-priya-nair",
    name: "Priya Nair",
    iitId: "iit-guwahati",
    projectIds: ["campus-connect"],
    expertise: ["React", "Node.js", "PostgreSQL"],
    github: "priyanair",
    email: "priya.mentor@iitg.ac.in",
    bio: "Full-stack engineer who likes building tools for campus communities. Big on code review as a teaching moment.",
  },
  {
    id: "mentor-karthik-s",
    name: "Karthik S",
    iitId: "iit-madras",
    projectIds: ["visionlab", "dataflow-viz"],
    expertise: ["Python", "Computer Vision", "Data Engineering"],
    github: "karthiks",
    email: "karthik.mentor@smail.iitm.ac.in",
    bio: "Works on applied ML tooling. Mentors across both the vision and data-viz tracks this cycle.",
  },
  {
    id: "mentor-ritika-singh",
    name: "Ritika Singh",
    iitId: "iit-patna",
    projectIds: ["eduscribe"],
    expertise: ["TypeScript", "Next.js", "Accessibility"],
    github: "ritikasingh",
    email: "ritika.mentor@iitp.ac.in",
    bio: "Frontend engineer focused on accessible, well-tested UI. Happy to review PRs of any size.",
  },
];

export const mentors: Mentor[] =
  process.env.NODE_ENV === "production" ? realMentors : [...realMentors, ...devSampleMentors];

export function getMentorById(id: string): Mentor | undefined {
  return mentors.find((m) => m.id === id);
}

export function getMentorsByProjectId(projectId: string): Mentor[] {
  return mentors.filter((m) => m.projectIds.includes(projectId));
}
