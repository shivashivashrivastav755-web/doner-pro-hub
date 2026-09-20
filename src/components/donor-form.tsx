import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { registerDonor } from "@/lib/registry.functions";
import { BOARD_KEY } from "@/lib/board-query";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/registry";
import { BloodChipPicker } from "@/components/blood-chip";
import { CheckboxRow, Field, TextArea, TextInput } from "@/components/forms";
import { Button, buttonClass } from "@/components/ui";

type Errors = Partial<Record<"full_name" | "blood_group" | "city" | "phone" | "last_donation", string>>;

const PHONE = /^[+\d][\d\s-]{4,19}$/;

export function DonorForm() {
  const queryClient = useQueryClient();
  const register = useServerFn(registerDonor);

  const [fullName, setFullName] = useState("");
  const [group, setGroup] = useState<BloodGroup | "">("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [lastDonation, setLastDonation] = useState("");
  const [note, setNote] = useState("");
  const [available, setAvailable] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (fullName.trim().length < 2) next.full_name = "Please enter the name donors will hear.";
    if (!group) next.blood_group = "Choose the group printed on your donor card.";
    if (city.trim().length < 2) next.city = "Which city or area should we list you under?";
    if (!PHONE.test(phone.trim())) next.phone = "Digits only, with an optional leading +.";
    if (lastDonation && new Date(lastDonation).getTime() > Date.now())
      next.last_donation = "That date is in the future.";
    return next;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problems = validate();
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    setPending(true);
    const result = await register({
      data: {
        full_name: fullName.trim(),
        blood_group: group as BloodGroup,
        city: city.trim(),
        phone: phone.trim(),
        last_donation: lastDonation || "",
        note: note.trim(),
        available,
      },
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: BOARD_KEY });
    toast.success("You're on the board. Thank you.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-planned-soft px-3 py-1 text-[11px] font-medium tracking-[0.1em] uppercase text-planned">
          <CheckCircle2 className="size-3.5" />
          Registered
        </span>
        <h3 className="display mt-4 text-[clamp(1.8rem,4vw,2.4rem)] text-foreground">
          {fullName.split(" ")[0]}, your name is on the registry.
        </h3>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Anyone searching for {group} near {city} will see you within seconds. Keep your phone
          reachable — a hospital usually calls at inconvenient hours.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/requests" className={buttonClass("primary", "md")}>
            See open requests
            <ArrowRight className="size-4" />
          </Link>
          <button
            type="button"
            className={buttonClass("quiet", "md")}
            onClick={() => {
              setDone(false);
              setFullName("");
              setGroup("");
              setCity("");
              setPhone("");
              setLastDonation("");
              setNote("");
              setAvailable(true);
            }}
          >
            Add another donor
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-border bg-card p-5 sm:p-7"
    >
      <div className="space-y-5">
        <Field label="Full name" htmlFor="donor-name" error={errors.full_name}>
          <TextInput
            id="donor-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="As your blood bank knows you"
            autoComplete="name"
            invalid={Boolean(errors.full_name)}
          />
        </Field>

        <div>
          <span className="flex items-baseline justify-between gap-3 pb-1.5">
            <span className="text-[13px] font-medium text-foreground">Blood group</span>
            <span className="text-[11px] text-muted-foreground">Marked groups are rarer</span>
          </span>
          <BloodChipPicker value={group} onChange={setGroup} name="Blood group" />
          {errors.blood_group ? (
            <span className="mt-1.5 block text-[12px] text-critical">{errors.blood_group}</span>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City or area" htmlFor="donor-city" error={errors.city}>
            <TextInput
              id="donor-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kolkata, Howrah, Barasat…"
              invalid={Boolean(errors.city)}
            />
          </Field>
          <Field label="Phone" htmlFor="donor-phone" hint="Shown masked" error={errors.phone}>
            <TextInput
              id="donor-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98300 00000"
              inputMode="tel"
              autoComplete="tel"
              invalid={Boolean(errors.phone)}
            />
          </Field>
        </div>

        <Field
          label="Last donation"
          htmlFor="donor-last"
          hint="Optional — helps us judge eligibility"
          error={errors.last_donation}
        >
          <TextInput
            id="donor-last"
            type="date"
            value={lastDonation}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setLastDonation(e.target.value)}
          />
        </Field>

        <Field label="Anything donors should know" htmlFor="donor-note" hint="Optional">
          <TextArea
            id="donor-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={240}
            placeholder="Weekday mornings only, can travel across the city…"
          />
        </Field>

        <CheckboxRow
          checked={available}
          onChange={setAvailable}
          label="I'm available to donate right now"
          hint="Uncheck while you're travelling or unwell and you'll be hidden from the board."
        />

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Adding you…" : "Put me on the board"}
          </Button>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Listing {BLOOD_GROUPS.length} groups · you can ask to be removed any time
          </p>
        </div>
      </div>
    </form>
  );
}
