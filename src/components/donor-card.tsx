import { MapPin } from "lucide-react";
import type { DonorRow } from "@/lib/registry.functions";
import { eligibilityHint, formatDate } from "@/lib/registry";
import { BloodChip } from "@/components/blood-chip";
import { ContactReveal } from "@/components/contact-reveal";
import { Panel } from "@/components/ui";

export function DonorCard({ donor }: { donor: DonorRow }) {
  return (
    <Panel as="article" className="flex flex-col gap-3 hover:border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-xl text-foreground">{donor.full_name}</h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="size-3.5" />
            {donor.city}
          </p>
        </div>
        <BloodChip group={donor.blood_group} size="lg" />
      </div>

      {donor.note ? (
        <p className="text-[14px] leading-relaxed text-foreground/80">“{donor.note}”</p>
      ) : null}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border pt-3 text-[12px]">
        <dt className="text-muted-foreground">Last donated</dt>
        <dd className="text-right font-mono text-foreground tabular-nums">
          {formatDate(donor.last_donation)}
        </dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd className="text-right text-[12px] text-planned">{eligibilityHint(donor.last_donation)}</dd>
      </dl>

      <div className="mt-auto pt-1">
        <ContactReveal contact={donor.phone} label="Show number" />
      </div>
    </Panel>
  );
}
