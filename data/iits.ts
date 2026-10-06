import type { IIT } from "@/lib/types";

/**
 * `logo`: path under /public, e.g. "/logos/iit-bombay.svg". Drop the file in
 * public/logos/ and set the path here; the UI falls back to a text badge
 * when unset.
 *
 * `emailDomains`: used to verify a student actually belongs to this institute
 * at signup. These are best-known public domains. Correct them here if
 * wrong, nothing else needs to change.
 */
export const iits: IIT[] = [
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    shortName: "IIT Bombay",
    city: "Mumbai",
    logo: "/logos/club-graph.png",
    emailDomains: ["iitb.ac.in"],
  },
  {
    id: "iit-guwahati",
    name: "Indian Institute of Technology Guwahati",
    shortName: "IIT Guwahati",
    city: "Guwahati",
    logo: "/logos/club-fold.png",
    emailDomains: ["iitg.ac.in"],
  },
  {
    id: "iit-madras",
    name: "Indian Institute of Technology Madras",
    shortName: "IIT Madras",
    city: "Chennai",
    logo: "/logos/madras-logo.png",
    emailDomains: ["smail.iitm.ac.in"],
  },
  {
    id: "iit-patna",
    name: "Indian Institute of Technology Patna",
    shortName: "IIT Patna",
    city: "Patna",
    logo: "/logos/club-jack.jpg",
    emailDomains: ["iitp.ac.in"],
  },
];

export function getIITById(id: string): IIT | undefined {
  return iits.find((iit) => iit.id === id);
}

export function findIITByEmail(email: string): IIT | undefined {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return undefined;
  return iits.find((iit) => iit.emailDomains.some((d) => domain === d || domain.endsWith(`.${d}`)));
}
