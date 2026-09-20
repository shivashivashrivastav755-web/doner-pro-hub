import { MapPin, Droplet } from "lucide-react";
import type { RequestRow } from "@/lib/registry.functions";
import { formatAgo } from "@/lib/registry";
import { BloodChip } from "@/components/blood-chip";
import { UrgencyTag } from "@/components/urgency-tag";
import { ContactReveal } from "@/components/contact-reveal";
import { Panel } from "@/components/ui";

export function RequestCard({ request }: { request: RequestRow }) {
  return (
    <Panel
      as="article"
      className="flex flex-col gap-4 hover:border-primary/35 data-[critical=true]:border-critical/35"
      data-critical={request.urgency === "critical"}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <UrgencyTag urgency={request.urgency} />
          <h3 className="display mt-3 text-2xl text-foreground">{request.patient_ref}</h3>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
          {formatAgo(request.created_at)}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <BloodChip group={request.blood_group} size="lg" />
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground tabular-nums">
          <Droplet className="size-3.5 text-primary" />
          {request.units} unit{request.units === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="size-3.5" />
          {request.city}
          {request.hospital ? ` · ${request.hospital}` : ""}
        </span>
      </div>

      {request.message ? (
        <p className="text-[15px] leading-relaxed text-foreground/85">{request.message}</p>
      ) : null}

      <div className="mt-auto border-t border-border pt-4">
        <ContactReveal contact={request.contact} />
      </div>
    </Panel>
  );
}
