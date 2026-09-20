import { createFileRoute, Link } from "@tanstack/react-router";

import { CompatibilityMatrix } from "@/components/compatibility-matrix";
import { SectionHeading, buttonClass } from "@/components/ui";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How the board works · Donor Pro Connect" },
      {
        name: "description",
        content:
          "What Donor Pro Connect does, what it deliberately doesn't do, and how your details are handled on the board.",
      },
      { property: "og:title", content: "How the board works · Donor Pro Connect" },
      {
        property: "og:description",
        content: "A plain walk-through of the donor board, the requests, and the numbers you can see.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksPage,
});

const FLOW = [
  {
    index: "01",
    title: "A family posts what the blood bank asked for",
    body: "Group, units, city, hospital and a contact that donors can reach. No full names, no patient documents — enough to recognise the request, nothing more.",
  },
  {
    index: "02",
    title: "Donors filter to their own group and area",
    body: "Anyone can open the registry and narrow it to one group in one city. Rare negative groups are marked, because those are the searches that stall.",
  },
  {
    index: "03",
    title: "The call goes directly to the ward",
    body: "Revealing a number shows you a dialable contact. From there it's a conversation between you and the family, and the blood bank arranges the rest.",
  },
  {
    index: "04",
    title: "Requests age out on their own",
    body: "Each request leaves the board after two weeks whether or not anyone marked it done, so the list doesn't fill up with stale appeals.",
  },
];

function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12">
      <SectionHeading
        eyebrow="Guide"
        title="How the board works"
        description="Small by design: two lists, one call, no accounts. Here is exactly what happens to your details."
      />

      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        {FLOW.map((step) => (
          <div key={step.index} className="bg-card p-6">
            <p className="font-mono text-[12px] text-primary tabular-nums">{step.index}</p>
            <h3 className="display mt-3 text-[26px] text-foreground">{step.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <CompatibilityMatrix />
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="eyebrow">What this is</p>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted-foreground">
            <li>· An open list of donors and requests, readable without signing in.</li>
            <li>· A way to reach a ward that would otherwise spend hours on phone trees.</li>
            <li>· Free, with nothing to install and no account to keep current.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-critical/30 bg-critical-soft p-6">
          <p className="eyebrow">What this isn't</p>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted-foreground">
            <li>· An emergency service. For an emergency, call 112 or your hospital first.</li>
            <li>· A medical record system. Nothing here replaces a blood bank's screening.</li>
            <li>· A marketplace. No one here pays or is paid for blood.</li>
          </ul>
        </div>
      </section>

      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-6">
        <div>
          <p className="display text-[26px] text-foreground">Ready when you are</p>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Register in a minute, or read what's on the board right now.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/register" className={buttonClass("primary", "md")}>
            Join the registry
          </Link>
          <Link to="/requests" className={buttonClass("quiet", "md")}>
            Open the board
          </Link>
        </div>
      </section>
    </div>
  );
}
