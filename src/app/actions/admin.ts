"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { endSession, requireStaff, startSession } from "@/lib/auth";
import { LEAD_STATUSES, PHOTO_ANGLES, VEHICLE_STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { draftVehicleSchema, publishVehicleSchema } from "@/lib/vehicle-schema";

/* ------------------------------------------------------------------ auth */

export type LoginState = { error?: string } | null;

// Equalise timing for unknown emails.
const DUMMY_HASH = bcrypt.hashSync("timing-equaliser-not-a-password", 10);

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await db.staffUser.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "Incorrect email or password." };

  await startSession(user);
  // Only allow redirects back into the portal.
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* -------------------------------------------------------------- vehicles */

export type SaveResult =
  | { ok: true; id: string; status: string }
  | { ok: false; errors: Record<string, string>; message: string };

function flatten(e: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[i.path.join(".")] ??= i.message;
  return out;
}

function revalidateShowroom(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  if (slug) revalidatePath(`/cars/${slug}`);
}

/**
 * Create or update a vehicle. `intent` = "draft" keeps it off the showroom;
 * "publish" validates the stricter publishing rules and sets it LIVE.
 */
export async function saveVehicle(input: unknown, intent: "draft" | "publish", id?: string): Promise<SaveResult> {
  await requireStaff();
  const schema = intent === "publish" ? publishVehicleSchema : draftVehicleSchema;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: flatten(parsed.error), message: "Please fix the highlighted fields." };
  }
  const d = parsed.data;

  const existing = id ? await db.vehicle.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, errors: {}, message: "This vehicle no longer exists." };

  const status =
    intent === "publish"
      ? "LIVE"
      : existing && existing.status !== "LIVE" ? existing.status : "DRAFT";

  const data = {
    ...d,
    images: JSON.stringify(d.images),
    inspection: JSON.stringify(d.inspection),
    status,
    slug: existing?.slug ?? slugify(d.year, d.make, d.model, d.variant, d.regNumber.replace(/\s/g, "")),
  };

  try {
    if (d.isFeatured) await db.vehicle.updateMany({ where: { isFeatured: true, NOT: { id } }, data: { isFeatured: false } });
    const row = existing
      ? await db.vehicle.update({ where: { id: existing.id }, data })
      : await db.vehicle.create({ data });
    revalidateShowroom(row.slug);
    return { ok: true, id: row.id, status: row.status };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, errors: { regNumber: "A vehicle with this registration already exists" }, message: "Duplicate registration number." };
    }
    throw e;
  }
}

export async function setVehicleStatus(id: string, status: string) {
  await requireStaff();
  const s = z.enum(VEHICLE_STATUSES).parse(status);
  if (s === "LIVE") {
    const current = await db.vehicle.findUnique({ where: { id }, select: { images: true, status: true } });
    const imgs = JSON.parse(current?.images ?? "[]") as { angle: string }[];
    if (current?.status !== "LIVE" && !PHOTO_ANGLES.every((a) => imgs.some((i) => i.angle === a.key))) {
      throw new Error("Upload all 6 mandatory photo angles before going live.");
    }
  }
  const row = await db.vehicle.update({
    where: { id },
    data: { status: s, soldAt: s === "SOLD" ? new Date() : null, ...(s !== "LIVE" ? { isFeatured: false } : {}) },
  });
  revalidateShowroom(row.slug);
}

/* ----------------------------------------------------------------- leads */

const leadUpdate = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  customerName: z.string().trim().min(1).max(80).optional(),
  customerPhone: z.string().trim().max(20).optional(),
});

export async function updateLead(id: string, patch: z.input<typeof leadUpdate>) {
  await requireStaff();
  await db.lead.update({ where: { id }, data: leadUpdate.parse(patch) });
  revalidatePath("/admin", "layout");
}
