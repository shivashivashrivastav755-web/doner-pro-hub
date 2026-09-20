import { cn } from "@/lib/utils";
import { BLOOD_GROUPS, isRhPositive, isRareGroup, type BloodGroup } from "@/lib/registry";

const SIZES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3.5 py-1.5 text-sm",
} as const;

export function BloodChip({
  group,
  size = "md",
  className,
}: {
  group: BloodGroup;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const positive = isRhPositive(group);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-tight tabular-nums",
        positive
          ? "border-primary/25 bg-primary-soft text-primary"
          : "border-accent/35 bg-planned-soft text-planned",
        SIZES[size],
        className,
      )}
      title={`${group} · ${positive ? "Rh positive" : "Rh negative"}${isRareGroup(group) ? " · rarer group" : ""}`}
    >
      <span className={cn("size-1.5 rounded-full", positive ? "bg-primary" : "bg-accent")} />
      {group}
    </span>
  );
}

export function BloodChipPicker({
  value,
  onChange,
  name,
  className,
}: {
  value: BloodGroup | "";
  onChange: (group: BloodGroup) => void;
  name?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="radiogroup" aria-label={name ?? "Blood group"}>
      {BLOOD_GROUPS.map((group) => {
        const active = value === group;
        const positive = isRhPositive(group);
        return (
          <button
            key={group}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(group)}
            className={cn(
              "group relative rounded-md border px-3 py-2 font-mono text-sm tabular-nums transition-all duration-200",
              active
                ? positive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-primary-soft",
            )}
          >
            {group}
            {isRareGroup(group) ? (
              <span
                className={cn(
                  "absolute -top-1 -right-1 size-1.5 rounded-full",
                  active ? "bg-background" : positive ? "bg-primary" : "bg-accent",
                )}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
