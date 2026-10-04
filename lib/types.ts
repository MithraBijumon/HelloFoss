export type Track = "Beginner" | "Advanced";

export interface IIT {
  id: string;
  name: string;
  shortName: string;
  city: string;
  logo?: string;
  /** Accepted student email domains for this institute, e.g. ["iitb.ac.in"]. */
  emailDomains: string[];
}

export interface Mentor {
  id: string;
  name: string;
  iitId: string;
  projectIds: string[];
  expertise: string[];
  github?: string;
  bio: string;
  avatar?: string;
  /** Matched against a verified login email to grant this mentor's account MENTOR access. */
  email?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  track: Track;
  iitId: string;
  technologies: string[];
  mentorIds: string[];
  repositoryUrl?: string;
  documentationUrl?: string;
  issuesUrl?: string;
  image?: string;
  featured?: boolean;
}

export type TimelineStatus = "upcoming" | "active" | "completed";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  status: TimelineStatus;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface CashPrize {
  id: string;
  title: string;
  /** Left unset ("Amount TBA") until the prize pool is finalized. */
  amount?: string;
  description: string;
}

/** A rule marked `provisional` is a proposed default awaiting organiser confirmation. */
export type Rule = string | { text: string; provisional: true };

export interface RuleSection {
  id: string;
  title: string;
  intro?: string;
  /** Marks every rule in the section as awaiting organiser confirmation. */
  provisional?: boolean;
  /** A single rule worth calling out above the rest. */
  callout?: string;
  rules: Rule[];
  /** When set, `rules` render as the "Do" column next to these. */
  donts?: string[];
}
