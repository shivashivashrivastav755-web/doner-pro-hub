import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/ui";

const NAV = [
  { to: "/requests", label: "Requests" },
  { to: "/donors", label: "Find donors" },
  { to: "/how-it-works", label: "How it works" },
] as const;

function Droplet() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 text-primary" fill="currentColor">
      <path d="M12 2.2c4.2 5.1 6.6 8.4 6.6 11.3A6.6 6.6 0 0 1 12 20.1a6.6 6.6 0 0 1-6.6-6.6C5.4 10.6 7.8 7.3 12 2.2Z" />
      <path
        d="M9.1 13.4c0 1.7 1.2 3 2.9 3.2"
        fill="none"
        stroke="var(--color-background)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <Droplet />
          <span className="display text-[19px] leading-none text-foreground">
            Donor Pro <span className="text-primary">Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/register" className={buttonClass("primary", "sm")}>
          Join the registry
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Droplet />
            <span className="display text-[18px] text-foreground">Donor Pro Connect</span>
          </div>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            A shared board of willing donors and live requests, so a hospital call doesn't have to
            start from zero.
          </p>
        </div>

        <div>
          <p className="eyebrow">Board</p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/register" className="text-muted-foreground hover:text-foreground">
                Join the registry
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">In an emergency</p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            This board is not an emergency service. For a medical emergency call{" "}
            <span className="font-mono text-foreground">112</span>, or the number your local
            hospital uses, first.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className={cn("mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5")}>
          <p className="text-[12px] text-muted-foreground">
            Donor Pro Connect · demonstration registry with sample records
          </p>
          <p className="text-[12px] text-muted-foreground">
            Blood groups shown for red cells · confirm with your blood bank
          </p>
        </div>
      </div>
    </footer>
  );
}
