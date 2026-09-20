import { URGENCY_META, type Urgency } from "@/lib/registry";

export const BOARD_KEY = ["board"] as const;

export function sortRequests<
  T extends { urgency: Urgency; created_at: string; expires_at: string },
>(requests: T[]) {
  return [...requests].sort((a, b) => {
    const rank = URGENCY_META[a.urgency].rank - URGENCY_META[b.urgency].rank;
    if (rank !== 0) return rank;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/** Requests due soonest, with the most urgent first inside each band. */
export function prioritiseRequests<
  T extends { urgency: Urgency; created_at: string; expires_at: string },
>(requests: T[]) {
  return sortRequests(requests);
}
