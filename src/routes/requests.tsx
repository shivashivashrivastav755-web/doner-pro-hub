import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, X } from "lucide-react";

import { getBoard } from "@/lib/registry.functions";
import { BOARD_KEY, sortRequests } from "@/lib/board-query";
import {
  BLOOD_GROUPS,
  URGENCIES,
  URGENCY_META,
  type BloodGroup,
  type Urgency,
} from "@/lib/registry";
import { RequestCard } from "@/components/request-card";
import { RequestForm } from "@/components/request-form";
import { SectionHeading, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Open requests · Donor Pro Connect" },
      {
        name: "description",
        content:
          "Every open blood request on the board, sorted by how soon it is needed. Filter by group, city or urgency, or post a request of your own.",
      },
      { property: "og:title", content: "Open requests · Donor Pro Connect" },
      {
        property: "og:description",
        content: "Blood requests that came in today, with contact details a tap away.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: BOARD_KEY,
      queryFn: () => getBoard(),
    });
  },
  component: RequestsPage,
});

function RequestsPage() {
  const fetchBoard = useServerFn(getBoard);
  const { data: board } = useSuspenseQuery({
    queryKey: BOARD_KEY,
    queryFn: () => fetchBoard(),
  });

  const [group, setGroup] = useState<BloodGroup | "all">("all");
  const [urgency, setUrgency] = useState<Urgency | "all">("all");
  const [city, setCity] = useState("");

  const cities = useMemo(() => {
    const set = new Set<string>();
    board.donors.forEach((donor) => set.add(donor.city));
    board.requests.forEach((request) => set.add(request.city));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [board]);

  const visible = useMemo(() => {
    const needle = city.trim().toLowerCase();
    return sortRequests(
      board.requests.filter((request) => {
        if (group !== "all" && request.blood_group !== group) return false;
        if (urgency !== "all" && request.urgency !== urgency) return false;
        if (needle && !request.city.toLowerCase().includes(needle)) return false;
        return true;
      }),
    );
  }, [board.requests, group, urgency, city]);

  const filtersOn = group !== "all" || urgency !== "all" || city.trim() !== "";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12">
      <SectionHeading
        eyebrow="The board"
        title="Open requests"
        description="Newest and most urgent first. Numbers stay masked until you choose to reveal them."
      />

      <div className="mt-7 space-y-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Group</span>
          <button
            type="button"
            onClick={() => setGroup("all")}
            aria-pressed={group === "all"}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
              group === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            All
          </button>
          {BLOOD_GROUPS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setGroup(option)}
              aria-pressed={group === option}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
                group === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Timing</span>
          <button
            type="button"
            onClick={() => setUrgency("all")}
            aria-pressed={urgency === "all"}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              urgency === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            Any
          </button>
          {URGENCIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setUrgency(option)}
              aria-pressed={urgency === option}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition-colors",
                urgency === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {URGENCY_META[option].label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              list="request-cities"
              placeholder="Filter by city — Kolkata, Howrah…"
              className="w-full rounded-md border border-input bg-card py-2.5 pr-3 pl-9 text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <datalist id="request-cities">
              {cities.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <p className="font-mono text-[12px] text-muted-foreground tabular-nums">
            {visible.length} shown
          </p>
          {filtersOn ? (
            <button
              type="button"
              onClick={() => {
                setGroup("all");
                setUrgency("all");
                setCity("");
              }}
              className={buttonClass("ghost", "sm")}
            >
              <X className="size-3.5" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {visible.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-lg border border-dashed border-border bg-surface p-10 text-center">
          <p className="display text-2xl text-foreground">Nothing matches those filters</p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Try widening the search — or clear the filters to see all {board.requests.length} open
            requests.
          </p>
        </div>
      )}

      <section className="mt-20">
        <SectionHeading
          eyebrow="Add to the board"
          title="Post a request"
          description="For a medical emergency, contact your hospital or the emergency line first. This board is a way to find willing donors faster, not a substitute for them."
        />
        <div className="mt-7">
          <RequestForm />
        </div>
      </section>
    </div>
  );
}
