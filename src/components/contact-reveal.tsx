import { useState } from "react";
import { Eye, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { maskPhone } from "@/lib/registry";
import { buttonClass } from "@/components/ui";

/**
 * Contact details stay masked until a visitor deliberately reveals them, so a
 * scraped page can't harvest the whole board in one pass.
 */
export function ContactReveal({
  contact,
  label = "Show contact",
  className,
}: {
  contact: string;
  label?: string;
  className?: string;
}) {
  const [shown, setShown] = useState(false);
  const dialable = /^[\d+][\d\s-]{4,}$/.test(contact);

  if (!shown) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {maskPhone(contact)}
        </span>
        <button
          type="button"
          onClick={() => setShown(true)}
          className={buttonClass("quiet", "sm")}
        >
          <Eye className="size-3.5" />
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {dialable ? (
        <a
          href={`tel:${contact.replace(/\s/g, "")}`}
          className={buttonClass("primary", "sm")}
        >
          <Phone className="size-3.5" />
          {contact}
        </a>
      ) : (
        <span className="font-mono text-sm text-foreground tabular-nums">{contact}</span>
      )}
      <button
        type="button"
        onClick={() => setShown(false)}
        className={buttonClass("ghost", "sm")}
      >
        Hide
      </button>
    </div>
  );
}
