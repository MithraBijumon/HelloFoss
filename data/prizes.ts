import type { CashPrize } from "@/lib/types";

/**
 * Amounts are intentionally left unset ("Amount TBA") until the prize pool
 * is finalized. Add an `amount` per prize once sponsorships are confirmed.
 */
export const cashPrizes: CashPrize[] = [
  {
    id: "best-contributor",
    title: "Best Contributor",
    description:
      "Awarded to the contributor with the most impactful merged work across all projects.",
  },
  {
    id: "best-first-pr",
    title: "Best First-Time Contributor",
    description:
      "For a first-ever open-source contribution that stood out for quality and effort.",
  },
];
