/**
 * Shared, browser-safe constants and helpers for the donor registry.
 * No database or server imports belong in this file.
 */

export const BLOOD_GROUPS = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const URGENCIES = ["critical", "soon", "planned"] as const;
export type Urgency = (typeof URGENCIES)[number];

export const URGENCY_META: Record<
  Urgency,
  { label: string; note: string; rank: number; text: string; soft: string; dot: string }
> = {
  critical: {
    label: "Needed now",
    note: "Within hours",
    rank: 0,
    text: "text-critical",
    soft: "bg-critical-soft",
    dot: "bg-critical",
  },
  soon: {
    label: "Needed soon",
    note: "Within a few days",
    rank: 1,
    text: "text-soon",
    soft: "bg-soon-soft",
    dot: "bg-soon",
  },
  planned: {
    label: "Planned drive",
    note: "Booked ahead",
    rank: 2,
    text: "text-planned",
    soft: "bg-planned-soft",
    dot: "bg-planned",
  },
};

/** Who can receive red cells from each group. */
export const DONATES_TO: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

/** Who each group can receive red cells from. */
export const RECEIVES_FROM: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

export function isRhPositive(group: BloodGroup) {
  return group.endsWith("+");
}

export function isRareGroup(group: BloodGroup) {
  return group === "AB-" || group === "B-" || group === "O-" || group === "A-";
}

/** Rough public-visible phone masking: keeps the city-call prefix readable. */
export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "•••• ••••";
  const head = digits.slice(0, digits.length - 7);
  const tail = digits.slice(-7);
  return `${head ? head + " " : ""}••• ${tail.slice(-3)}`;
}

export function formatAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysSince(dateOnly: string | null) {
  if (!dateOnly) return null;
  const date = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

export function eligibilityHint(lastDonation: string | null) {
  const days = daysSince(lastDonation);
  if (days === null) return "Last donation not recorded";
  if (days >= 90) return "Likely eligible — bank will confirm";
  if (days >= 56) return "Approaching the 90-day window";
  return `About ${days} days since last donation`;
}
