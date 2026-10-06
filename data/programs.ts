/**
 * Other open-source programmes to point contributors to after Hello FOSS.
 * Timings are deliberately approximate ("usually", "every October") since
 * exact dates change each year. Each card links to the official site.
 */
export interface Program {
  id: string;
  name: string;
  organiser: string;
  when: string;
  url: string;
  description: string;
  tags: string[];
}

export const programs: Program[] = [
  {
    id: "hacktoberfest",
    name: "Hacktoberfest",
    organiser: "DigitalOcean",
    when: "Every October",
    url: "https://hacktoberfest.com",
    description:
      "A month-long open-source event. Get a set number of pull requests accepted in participating repositories during October to complete the challenge.",
    tags: ["Beginner-friendly", "Online", "Global"],
  },
  {
    id: "gsoc",
    name: "Google Summer of Code",
    organiser: "Google",
    when: "Applications in spring, coding over summer",
    url: "https://summerofcode.withgoogle.com",
    description:
      "Work on a summer-long project with an open-source organisation, guided by its mentors. Contributors write a proposal, and selected ones receive a stipend.",
    tags: ["Stipend", "Mentored", "Proposal-based"],
  },
  {
    id: "lfx",
    name: "LFX Mentorship",
    organiser: "The Linux Foundation",
    when: "Several terms a year",
    url: "https://lfx.linuxfoundation.org/tools/mentorship/",
    description:
      "Paid mentorships on Linux Foundation projects, including cloud-native projects under the CNCF. A good next step if you enjoyed infrastructure or systems work.",
    tags: ["Stipend", "Mentored"],
  },
  {
    id: "outreachy",
    name: "Outreachy",
    organiser: "Software Freedom Conservancy",
    when: "Two cohorts a year",
    url: "https://www.outreachy.org",
    description:
      "Paid, remote internships in open source and open science for people who face under-representation or systemic bias in the tech industry.",
    tags: ["Stipend", "Remote", "Internship"],
  },
  {
    id: "gssoc",
    name: "GirlScript Summer of Code",
    organiser: "GirlScript Foundation",
    when: "Usually in summer",
    url: "https://gssoc.girlscript.tech",
    description:
      "An India-based, beginner-friendly open-source programme open to everyone. Contributors work on listed projects with mentors over a few months.",
    tags: ["Beginner-friendly", "India", "Mentored"],
  },
];
