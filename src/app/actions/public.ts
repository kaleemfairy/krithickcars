"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeRegNumber } from "@/lib/format";
import { dealerWhatsApp, toWhatsAppNumber } from "@/lib/whatsapp";

export type FormState =
  | { ok: true; whatsappUrl: string; message: string }
  | { ok: false; errors?: Record<string, string>; message?: string }
  | null;

const phone = z
  .string()
  .trim()
  .refine((p) => {
    try {
      toWhatsAppNumber(p);
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid 10-digit Indian mobile number");

const valuationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone,
  carModel: z.string().trim().min(2, "Which car is it? e.g. Hyundai i20 Asta").max(80),
  year: z.coerce.number().int().min(1995, "Year looks too old").max(new Date().getFullYear(), "Year can't be in the future"),
  regNumber: z.string().trim().min(6, "Enter the registration number").max(16),
  website: z.string().max(0).optional(), // honeypot
});

function fieldErrors(e: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

/** "Sell or Exchange" quick valuation — stores a lead, then hands off to WhatsApp. */
export async function requestValuation(_: FormState, form: FormData): Promise<FormState> {
  const parsed = valuationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (d.website) return { ok: false, message: "Something went wrong." };

  const reg = normalizeRegNumber(d.regNumber);
  await db.lead.create({
    data: {
      customerName: d.name,
      customerPhone: `+${toWhatsAppNumber(d.phone)}`,
      channel: "FORM",
      kind: "VALUATION",
      message: `${d.carModel} · ${d.year} · ${reg}`,
    },
  });

  const text =
    `Hello Krithick Cars! I'd like an instant valuation for my car.\n` +
    `Car: ${d.carModel}\nYear: ${d.year}\nReg No: ${reg}\nName: ${d.name}`;
  return { ok: true, whatsappUrl: dealerWhatsApp(text), message: "Request received! Our valuation desk will reply within 30 minutes." };
}

const testDriveSchema = z.object({
  vehicleId: z.string().min(1),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  slot: z.enum(["Morning", "Afternoon", "Evening"]),
  website: z.string().max(0).optional(),
});

export async function bookTestDrive(_: FormState, form: FormData): Promise<FormState> {
  const parsed = testDriveSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (d.website) return { ok: false, message: "Something went wrong." };

  const v = await db.vehicle.findFirst({ where: { id: d.vehicleId, status: { in: ["LIVE", "BOOKED"] } } });
  if (!v) return { ok: false, message: "This car is no longer available." };

  await db.lead.create({
    data: {
      vehicleId: v.id,
      customerName: d.name,
      customerPhone: `+${toWhatsAppNumber(d.phone)}`,
      channel: "FORM",
      kind: "TEST_DRIVE",
      message: `Requested ${d.date} · ${d.slot}`,
    },
  });
  const text =
    `Hello Krithick Cars! I'd like to test drive the ${v.year} ${v.make} ${v.model} ${v.variant} (${v.regNumber}) ` +
    `on ${d.date} (${d.slot.toLowerCase()}). Name: ${d.name}.`;
  return { ok: true, whatsappUrl: dealerWhatsApp(text), message: "Test drive requested — we'll confirm your slot on WhatsApp." };
}
