import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  BLOOD_GROUPS,
  DONATES_TO,
  RECEIVES_FROM,
  type BloodGroup,
} from "@/lib/registry";
import { BloodChip } from "@/components/blood-chip";

export function CompatibilityMatrix() {
  const [group, setGroup] = useState<BloodGroup>("O-");
  const gives = DONATES_TO[group];
  const takes = RECEIVES_FROM[group];

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Reference · red cells</p>
          <h3 className="display mt-1 text-2xl text-foreground">Who can give to whom</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BLOOD_GROUPS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setGroup(option)}
              aria-pressed={group === option}
              className={
                "rounded-md border px-2.5 py-1 font-mono text-xs tabular-nums transition-colors " +
                (group === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-[12px] tracking-[0.1em] uppercase text-muted-foreground">
            {group} can donate to
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {gives.map((target) => (
              <BloodChip key={target} group={target} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12px] tracking-[0.1em] uppercase text-muted-foreground">
            {group} can receive from
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {takes.map((source) => (
              <BloodChip key={source} group={source} />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
        <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
        A general guide for red cells only. Plasma matching runs the other way round, and your
        blood bank always makes the final call.
      </p>
    </div>
  );
}
