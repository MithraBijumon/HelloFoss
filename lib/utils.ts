type ClassValue = string | number | null | undefined | boolean | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }
  return out.join(" ");
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 hours ago", "yesterday", etc. */
export function timeAgo(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  for (const [unit, secondsInUnit] of UNITS) {
    if (seconds >= secondsInUnit) return RELATIVE_TIME.format(-Math.round(seconds / secondsInUnit), unit);
  }
  return RELATIVE_TIME.format(-Math.round(seconds), "second");
}
