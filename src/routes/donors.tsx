import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, X } from "lucide-react";

import { getBoard } from "@/lib/registry.functions";
import { BOARD_KEY } from "@/lib/board-query";
import { BLOOD_GROUPS, isRareGroup, type BloodGroup } from "@/lib/registry";
import { DonorCard } from "@/components/donor-card";
import { SectionHeading, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/donors")({
  head: () => ({
    meta: [
      { title: "Find a donor · Donor Pro Connect" },
      {
        name: "description",
        content:
          "Search registered donors by blood group and area. Every donor here agreed to be contacted by a patient's family.",
      },
      { property: "og:title", content: "Find a donor · Donor Pro Connect" },
      {
        property: "og:description",
        content: "Filter the donor registry by group and city, then make the call.",
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
  component: DonorsPage,
});

function DonorsPage() {
  const fetchBoard = useServerFn(getBoard);
  const { data: board } = useSuspenseQuery({
    queryKey: BOARD_KEY,
    queryFn: () => fetchBoard(),
  });

  const [group, setGroup] = useState<BloodGroup | "all">("all");
  const [city, setCity] = useState("");

  const cities = useMemo(() => {
    const set = new Set<string>();
    board.donors.forEach((donor) => set.add(donor.city));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [board.donors]);

  const visible = useMemo(() => {
    const needle = city.trim().toLowerCase();
    return board.donors.filter((donor) => {
      if (group !== "all" && donor.blood_group !== group) return false;
      if (needle && !donor.city.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [board.donors, group, city]);

  const filtersOn = group !== "all" || city.trim() !== "";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12">
      <SectionHeading
        eyebrow="The registry"
        title="People who said yes"
        description="Donors available to give right now. Their numbers stay masked until you reveal them."
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
              title={isRareGroup(option) ? "Rarer group" : undefined}
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              list="donor-cities"
              placeholder="Filter by city or area"
              className="w-full rounded-md border border-input bg-card py-2.5 pr-3 pl-9 text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <datalist id="donor-cities">
              {cities.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <p className="font-mono text-[12px] text-muted-foreground tabular-nums">
            {visible.length} of {board.donors.length} donors
          </p>
          {filtersOn ? (
            <button
              type="button"
              onClick={() => {
                setGroup("all");
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
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((donor) => (
            <DonorCard key={donor.id} donor={donor} />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-lg border border-dashed border-border bg-surface p-10 text-center">
          <p className="display text-2xl text-foreground">No donors match those filters yet</p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Rare groups are thin on the board. If you or someone you know can register, that gap
            closes today.
          </p>
        </div>
      )}
    </div>
  );
}
