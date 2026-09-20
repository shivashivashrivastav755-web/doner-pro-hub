import { cn } from "@/lib/utils";
import { URGENCY_META, type Urgency } from "@/lib/registry";

export function UrgencyTag({
  urgency,
  className,
}: {
  urgency: Urgency;
  className?: string;
}) {
  const meta = URGENCY_META[urgency];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] uppercase",
        meta.soft,
        meta.text,
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          meta.dot,
          urgency === "critical" && "animate-pulse-dot",
        )}
      />
      {meta.label}
    </span>
  );
}
