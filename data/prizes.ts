import { iits } from "@/data/iits";

/**
 * Hello FOSS 2026 prize structure (amounts in INR). Every participating IIT
 * awards the same institute-level prizes; the overall top three, chosen from
 * the institute-level winners, get a bonus on top of their institute prize.
 * Totals shown on the site are computed from these numbers.
 */
export const institutePrizes = [
  { place: "1st", amount: 6000 },
  { place: "2nd", amount: 4000 },
  { place: "3rd", amount: 2000 },
];

export const overallBonuses = [
  { place: "1st", amount: 3000 },
  { place: "2nd", amount: 2000 },
  { place: "3rd", amount: 1000 },
];

const sum = (prizes: { amount: number }[]) => prizes.reduce((total, p) => total + p.amount, 0);

export const institutePool = sum(institutePrizes) * iits.length;
export const bonusPool = sum(overallBonuses);
export const totalPrizePool = institutePool + bonusPool;

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
