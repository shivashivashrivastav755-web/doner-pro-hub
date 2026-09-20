import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { BLOOD_GROUPS, URGENCIES, type BloodGroup, type Urgency } from "./registry";
import { createPublishableClient } from "./registry.server";

export type RequestRow = {
  id: string;
  patient_ref: string;
  blood_group: BloodGroup;
  units: number;
  city: string;
  hospital: string | null;
  contact: string;
  message: string | null;
  urgency: Urgency;
  created_at: string;
  expires_at: string;
};

export type DonorRow = {
  id: string;
  full_name: string;
  blood_group: BloodGroup;
  city: string;
  phone: string;
  last_donation: string | null;
  note: string | null;
  available: boolean;
  created_at: string;
};

export type Board = {
  requests: RequestRow[];
  donors: DonorRow[];
  stats: {
    donors: number;
    openRequests: number;
    critical: number;
    cities: number;
  };
};

export type SubmitResult = { ok: true; id: string } | { ok: false; error: string };

const dateOnly = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to choose a day.");

const donorInput = z.object({
  full_name: z.string().trim().min(2, "Tell us who to call").max(80),
  blood_group: z.enum(BLOOD_GROUPS),
  city: z.string().trim().min(2, "Which city are you in?").max(60),
  phone: z
    .string()
    .trim()
    .min(6, "That number looks too short")
    .max(20, "That number looks too long")
    .regex(/^[+\d][\d\s-]{4,19}$/, "Digits only, with an optional leading +."),
  last_donation: dateOnly.nullable().or(z.literal("")).transform((value) =>
    value === "" ? null : value,
  ),
  note: z.string().trim().max(240).optional().or(z.literal("")),
  available: z.boolean(),
});

const requestInput = z.object({
  patient_ref: z.string().trim().min(2, "Who needs it? Initials are enough").max(60),
  blood_group: z.enum(BLOOD_GROUPS),
  units: z.coerce.number().int().min(1).max(20),
  city: z.string().trim().min(2, "Which city?").max(60),
  hospital: z.string().trim().max(80).optional().or(z.literal("")),
  contact: z.string().trim().min(6, "A number or email donors can reach").max(60),
  message: z.string().trim().max(400).optional().or(z.literal("")),
  urgency: z.enum(URGENCIES),
});

function friendlyError(error: { message?: string }, fallback: string) {
  const message = (error.message ?? "").toLowerCase();
  if (message.includes("check constraint")) {
    return "One of the details is outside the range we accept. Please review and try again.";
  }
  if (message.includes("duplicate")) {
    return "This entry already appears to be on the board.";
  }
  if (message.includes("row-level security") || message.includes("permission")) {
    return "The board is currently read-only. Please try again shortly.";
  }
  return fallback;
}

export const getBoard = createServerFn({ method: "GET" }).handler(async (): Promise<Board> => {
  const supabase = createPublishableClient();
  const now = new Date().toISOString();

  const [requestsRes, donorsRes, donorCountRes, openCountRes] = await Promise.all([
    supabase
      .from("requests")
      .select("*")
      .eq("status", "open")
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("donors")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("donors")
      .select("id", { count: "exact", head: true })
      .eq("available", true),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .gt("expires_at", now),
  ]);

  if (requestsRes.error) {
    console.error("requests read failed", requestsRes.error);
    throw new Error(friendlyError(requestsRes.error, "The request board could not be loaded."));
  }
  if (donorsRes.error) {
    console.error("donors read failed", donorsRes.error);
    throw new Error(friendlyError(donorsRes.error, "The donor registry could not be loaded."));
  }

  const requests = (requestsRes.data ?? []) as unknown as RequestRow[];
  const donors = (donorsRes.data ?? []) as unknown as DonorRow[];
  const cities = new Set(donors.map((donor) => donor.city.trim().toLowerCase()));
  requests.forEach((request) => cities.add(request.city.trim().toLowerCase()));

  return {
    requests,
    donors,
    stats: {
      donors: donorCountRes.count ?? donors.length,
      openRequests: openCountRes.count ?? requests.length,
      critical: requests.filter((request) => request.urgency === "critical").length,
      cities: cities.size,
    },
  };
});

export const registerDonor = createServerFn({ method: "POST" })
  .inputValidator((data) => donorInput.parse(data))
  .handler(async ({ data }): Promise<SubmitResult> => {
    const supabase = createPublishableClient();

    const { data: inserted, error } = await supabase
      .from("donors")
      .insert({
        full_name: data.full_name,
        blood_group: data.blood_group,
        city: data.city,
        phone: data.phone,
        last_donation: data.last_donation,
        note: data.note || null,
        available: data.available,
      })
      .select("id")
      .single();

    if (error) {
      console.error("donor insert failed", error);
      return { ok: false, error: friendlyError(error, "Your details could not be saved.") };
    }

    return { ok: true, id: inserted.id };
  });

export const postRequest = createServerFn({ method: "POST" })
  .inputValidator((data) => requestInput.parse(data))
  .handler(async ({ data }): Promise<SubmitResult> => {
    const supabase = createPublishableClient();

    const { data: inserted, error } = await supabase
      .from("requests")
      .insert({
        patient_ref: data.patient_ref,
        blood_group: data.blood_group,
        units: data.units,
        city: data.city,
        hospital: data.hospital || null,
        contact: data.contact,
        message: data.message || null,
        urgency: data.urgency,
      })
      .select("id")
      .single();

    if (error) {
      console.error("request insert failed", error);
      return { ok: false, error: friendlyError(error, "Your request could not be posted.") };
    }

    return { ok: true, id: inserted.id };
  });
