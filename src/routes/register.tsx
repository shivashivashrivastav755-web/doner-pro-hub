import { createFileRoute, Link } from "@tanstack/react-router";

import { DonorForm } from "@/components/donor-form";
import { SectionHeading, buttonClass } from "@/components/ui";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Join the registry · Donor Pro Connect" },
      {
        name: "description",
        content:
          "Add your blood group, area and phone once, and a patient's family can reach you the moment they need it.",
      },
      { property: "og:title", content: "Join the registry · Donor Pro Connect" },
      {
        property: "og:description",
        content: "One minute to register. You decide when you're available.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const NOTES = [
  {
    title: "What happens next",
    body: "Your name appears on the donor board straight away. Families searching your group and area see it, then ring you. Nothing else happens automatically.",
  },
  {
    title: "What people see",
    body: "Name, group, area, when you last gave, and a masked number. The number is only readable after someone taps to reveal it.",
  },
  {
    title: "When you can't",
    body: "Unwell, travelling or out of window? Uncheck availability and you drop off the board until you check it again.",
  },
];

function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12">
      <SectionHeading
        eyebrow="Registry"
        title="Add yourself once"
        description="A ward looking for your group will find you in seconds instead of starting from an empty phone book."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <DonorForm />

        <aside className="space-y-4">
          {NOTES.map((note) => (
            <div key={note.title} className="rounded-lg border border-border bg-card p-5">
              <p className="eyebrow">{note.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{note.body}</p>
            </div>
          ))}

          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="eyebrow">Before you register</p>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted-foreground">
              <li>· Most blood banks ask for adults between 18 and 65, in reasonable health.</li>
              <li>· Roughly three months usually has to pass between whole-blood donations.</li>
              <li>· Certain medicines, infections and recent tattoos pause eligibility.</li>
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              The blood bank running the donation makes the final call on eligibility — not this
              board.
            </p>
            <Link to="/how-it-works" className={buttonClass("quiet", "sm", "mt-4")}>
              Read how it works
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
