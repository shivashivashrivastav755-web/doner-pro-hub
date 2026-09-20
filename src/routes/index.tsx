import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react";

import heroInk from "@/assets/hero-ink.jpg";
import { getBoard } from "@/lib/registry.functions";
import { BOARD_KEY, sortRequests } from "@/lib/board-query";
import { BloodChip } from "@/components/blood-chip";
import { CompatibilityMatrix } from "@/components/compatibility-matrix";
import { RequestCard } from "@/components/request-card";
import { SectionHeading, ButtonLink } from "@/components/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Donor Pro Connect — someone near you needs your blood group" },
      {
        name: "description",
        content:
          "A live board of blood requests and registered donors. Add your name in a minute, or see who needs blood right now.",
      },
      { property: "og:title", content: "Donor Pro Connect — someone near you needs your blood group" },
      {
        property: "og:description",
        content:
          "Read the board, find a match, make the call. Donors and requests in one open list.",
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
  component: Index,
});

const STEPS = [
  {
    index: "01",
    title: "Say yes once",
    body: "Give your group, your area and a number. It takes about a minute and there is nothing to install.",
  },
  {
    index: "02",
    title: "The board stays current",
    body: "Requests expire on their own after two weeks, so what you see is what a hospital is dealing with today.",
  },
  {
    index: "03",
    title: "A call, not a queue",
    body: "When something matches you, you ring the ward directly. No middleman deciding who gets the blood.",
  },
];

function Index() {
  const fetchBoard = useServerFn(getBoard);
  const { data: board } = useSuspenseQuery({
    queryKey: BOARD_KEY,
    queryFn: () => fetchBoard(),
  });

  const critical = board.requests.filter((request) => request.urgency === "critical");
  const featured = sortRequests(board.requests).slice(0, 3);

  return (
    <div className="pb-4">
      <section className="paper-grain border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="animate-rise">
            <p className="eyebrow">One board · donors and requests</p>
            <h1 className="display mt-4 text-[clamp(2.5rem,6.2vw,4.4rem)] text-foreground">
              Someone nearby is
              <br />
              looking for your
              <br />
              <span className="text-primary">blood group.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Donor Pro Connect keeps two lists in one place: people who agreed to donate, and
              requests that came in. Read them both freely, then make the call yourself.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/register" size="lg">
                Add me to the registry
              </ButtonLink>
              <ButtonLink to="/requests" variant="quiet" size="lg">
                See who needs blood
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
              <ShieldCheck className="size-4 text-planned" />
              Phone numbers stay masked until a visitor chooses to reveal them.
            </p>
          </div>

          <figure className="animate-rise relative">
            <img
              src={heroInk}
              alt="A single drop of blood spreading through cream paper fibres"
              width={1200}
              height={1504}
              className="aspect-[4/5] w-full rounded-lg border border-border object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full border border-border bg-background/92 px-3 py-1.5 font-mono text-[11px] text-foreground tabular-nums">
              {board.stats.donors} donors · {board.stats.cities} areas listed
            </figcaption>
          </figure>
        </div>
      </section>

      {critical.length > 0 ? (
        <div className="overflow-hidden border-b border-border bg-critical-soft">
          <div className="flex w-max animate-ticker gap-10 py-2.5">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 items-center gap-10 pr-10"
                aria-hidden={copy === 1}
              >
                {critical.map((request) => (
                  <span
                    key={request.id}
                    className="flex items-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-critical"
                  >
                    <span className="size-1.5 animate-pulse-dot rounded-full bg-critical" />
                    {request.blood_group} needed · {request.city}
                    {request.hospital ? ` · ${request.hospital}` : ""} · {request.units} unit
                    {request.units === 1 ? "" : "s"}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-border px-5 sm:grid-cols-4">
          {[
            { value: board.stats.donors, label: "Donors listed" },
            { value: board.stats.openRequests, label: "Open requests" },
            { value: board.stats.critical, label: "Needed within hours" },
            { value: board.stats.cities, label: "Areas covered" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-8 first:pl-0 sm:px-6">
              <p className="display text-[clamp(2.2rem,5vw,3.2rem)] leading-none text-foreground tabular-nums">
                {stat.value}
              </p>
              <p className="mt-2 text-[12px] tracking-[0.1em] uppercase text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-16">
        <SectionHeading
          eyebrow="On the board now"
          title="Who needs blood"
          description="Every open request, newest first. Contact details appear only when you decide to look."
          action={
            <ButtonLink to="/requests" variant="quiet">
              Open the full board
              <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {featured.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-20">
        <SectionHeading eyebrow="How it runs" title="Three steps, no account" />
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.index} className="bg-card p-6">
              <p className="font-mono text-[12px] text-primary tabular-nums">{step.index}</p>
              <h3 className="display mt-3 text-2xl text-foreground">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-20">
        <CompatibilityMatrix />
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-20">
        <div className="rounded-lg border border-primary/25 bg-primary-soft p-7 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">The registry</p>
              <h2 className="display mt-2 text-[clamp(1.9rem,4vw,2.75rem)] text-foreground">
                Your group could be the one a ward is searching for.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Add yourself once. You can ask to be taken off the board any time, and nothing
                happens until a patient's family rings you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/register" size="lg">
                <Phone className="size-4" />
                Join the registry
              </ButtonLink>
              <ButtonLink to="/donors" variant="quiet" size="lg">
                Browse donors
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
