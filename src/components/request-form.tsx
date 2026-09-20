import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { postRequest } from "@/lib/registry.functions";
import { BOARD_KEY } from "@/lib/board-query";
import { URGENCIES, URGENCY_META, type BloodGroup, type Urgency } from "@/lib/registry";
import { BloodChipPicker } from "@/components/blood-chip";
import { Field, TextArea, TextInput } from "@/components/forms";
import { Button } from "@/components/ui";

type Errors = Partial<
  Record<"patient_ref" | "blood_group" | "city" | "contact" | "units", string>
>;

export function RequestForm() {
  const queryClient = useQueryClient();
  const post = useServerFn(postRequest);

  const [patientRef, setPatientRef] = useState("");
  const [group, setGroup] = useState<BloodGroup | "">("");
  const [units, setUnits] = useState(1);
  const [city, setCity] = useState("");
  const [hospital, setHospital] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("soon");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (patientRef.trim().length < 2)
      next.patient_ref = "Initials and age are enough — never a full name.";
    if (!group) next.blood_group = "Pick the group the blood bank asked for.";
    if (city.trim().length < 2) next.city = "Which city should donors see?";
    if (contact.trim().length < 6) next.contact = "A number or email donors can reach.";
    if (units < 1 || units > 20) next.units = "Between 1 and 20 units.";
    return next;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problems = validate();
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    setPending(true);
    const result = await post({
      data: {
        patient_ref: patientRef.trim(),
        blood_group: group as BloodGroup,
        units,
        city: city.trim(),
        hospital: hospital.trim(),
        contact: contact.trim(),
        message: message.trim(),
        urgency,
      },
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: BOARD_KEY });
    toast.success("Your request is on the board.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-planned-soft px-3 py-1 text-[11px] font-medium tracking-[0.1em] uppercase text-planned">
          <CheckCircle2 className="size-3.5" />
          Posted
        </span>
        <h3 className="display mt-4 text-[clamp(1.6rem,4vw,2.2rem)] text-foreground">
          {group} · {units} unit{units === 1 ? "" : "s"} · {city}
        </h3>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          The request now sits at the top of the board. Donors see your contact only after they
          choose to reveal it, so keep your phone with you.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="quiet"
            onClick={() => {
              setDone(false);
              setPatientRef("");
              setGroup("");
              setUnits(1);
              setHospital("");
              setMessage("");
              setContact("");
            }}
          >
            Post another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-lg border border-border bg-card p-5 sm:p-7">
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Who needs it"
            htmlFor="req-patient"
            hint="Initials + age"
            error={errors.patient_ref}
          >
            <TextInput
              id="req-patient"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              placeholder="R. K., 34"
              invalid={Boolean(errors.patient_ref)}
            />
          </Field>
          <Field label="City" htmlFor="req-city" error={errors.city}>
            <TextInput
              id="req-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kolkata"
              invalid={Boolean(errors.city)}
            />
          </Field>
        </div>

        <div>
          <span className="block pb-1.5 text-[13px] font-medium text-foreground">
            Blood group needed
          </span>
          <BloodChipPicker value={group} onChange={setGroup} name="Blood group needed" />
          {errors.blood_group ? (
            <span className="mt-1.5 block text-[12px] text-critical">{errors.blood_group}</span>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Units" htmlFor="req-units" error={errors.units}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Fewer units"
                onClick={() => setUnits((value) => Math.max(1, value - 1))}
                className="flex size-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-primary/40"
              >
                <Minus className="size-4" />
              </button>
              <input
                id="req-units"
                type="number"
                min={1}
                max={20}
                value={units}
                onChange={(e) => setUnits(Number(e.target.value) || 1)}
                className="w-full rounded-md border border-input bg-surface px-3 py-2.5 text-center font-mono text-[15px] tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                aria-label="More units"
                onClick={() => setUnits((value) => Math.min(20, value + 1))}
                className="flex size-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-primary/40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </Field>
          <Field label="Hospital" htmlFor="req-hospital" hint="Optional">
            <TextInput
              id="req-hospital"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="Medical Research Institute"
            />
          </Field>
        </div>

        <div>
          <span className="block pb-1.5 text-[13px] font-medium text-foreground">How soon</span>
          <div className="flex flex-wrap gap-2">
            {URGENCIES.map((option) => {
              const meta = URGENCY_META[option];
              const active = urgency === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setUrgency(option)}
                  className={
                    "rounded-md border px-3 py-2 text-left text-[13px] transition-colors " +
                    (active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/40")
                  }
                >
                  <span className="block font-medium">{meta.label}</span>
                  <span
                    className={
                      "block text-[11px] " +
                      (active ? "text-primary-foreground/75" : "text-muted-foreground")
                    }
                  >
                    {meta.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Contact donors" htmlFor="req-contact" error={errors.contact}>
          <TextInput
            id="req-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+91 98300 00000 or ward number"
            invalid={Boolean(errors.contact)}
          />
        </Field>

        <Field label="What's happening" htmlFor="req-message" hint="Optional · 400 characters">
          <TextArea
            id="req-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={400}
            placeholder="Surgery is scheduled this afternoon; donors can go straight to the ward."
          />
        </Field>

        <div className="border-t border-border pt-5">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Posting…" : "Post to the board"}
          </Button>
        </div>
      </div>
    </form>
  );
}
