import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { BODY_TYPES, BUDGETS, FUEL_TYPES, SORTS, TRANSMISSIONS } from "./constants";
import { parseVehicle, toPublic, type PublicVehicle } from "./vehicle";

export type InventoryFilters = {
  q: string;
  budget: string;
  fuel: string;
  transmission: string;
  body: string;
  sort: string;
};

type RawParams = Record<string, string | string[] | undefined>;

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const oneOf = (v: string, allowed: readonly string[]) => (allowed.includes(v) ? v : "");

export function parseFilters(sp: RawParams): InventoryFilters {
  return {
    q: pick(sp.q).trim().slice(0, 60),
    budget: oneOf(pick(sp.budget), BUDGETS.map((b) => b.key)),
    fuel: oneOf(pick(sp.fuel).toUpperCase(), FUEL_TYPES),
    transmission: oneOf(pick(sp.transmission).toUpperCase(), TRANSMISSIONS),
    body: oneOf(pick(sp.body).toUpperCase(), BODY_TYPES),
    sort: oneOf(pick(sp.sort), SORTS.map((s) => s.key)) || "featured",
  };
}

const ORDER: Record<string, Prisma.VehicleOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  price_asc: [{ askingPrice: "asc" }],
  price_desc: [{ askingPrice: "desc" }],
  year_desc: [{ year: "desc" }, { odometerKm: "asc" }],
  km_asc: [{ odometerKm: "asc" }],
};

export async function searchInventory(f: InventoryFilters): Promise<PublicVehicle[]> {
  const where: Prisma.VehicleWhereInput = { status: "LIVE" };
  const and: Prisma.VehicleWhereInput[] = [];

  if (f.q) {
    for (const term of f.q.split(/\s+/).filter(Boolean)) {
      and.push({
        OR: [
          { make: { contains: term, mode: "insensitive" } },
          { model: { contains: term, mode: "insensitive" } },
          { variant: { contains: term, mode: "insensitive" } },
          { bodyType: { contains: term, mode: "insensitive" } },
        ],
      });
    }
  }
  const budget = BUDGETS.find((b) => b.key === f.budget);
  if (budget) and.push({ askingPrice: { gte: budget.min, lt: budget.max } });
  if (f.fuel) and.push({ fuelType: f.fuel });
  if (f.transmission) and.push({ transmission: f.transmission });
  if (f.body) and.push({ bodyType: f.body });
  if (and.length) where.AND = and;

  const rows = await db.vehicle.findMany({ where, orderBy: ORDER[f.sort] ?? ORDER.featured });
  return rows.map((r) => toPublic(parseVehicle(r)));
}

export async function getFeaturedVehicle(): Promise<PublicVehicle | null> {
  const row = await db.vehicle.findFirst({
    where: { status: "LIVE" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  return row ? toPublic(parseVehicle(row)) : null;
}

export async function getPublicVehicle(slug: string): Promise<PublicVehicle | null> {
  const row = await db.vehicle.findFirst({
    where: { slug, status: { in: ["LIVE", "BOOKED"] } },
  });
  return row ? toPublic(parseVehicle(row)) : null;
}

export async function getSimilarVehicles(v: PublicVehicle, take = 3): Promise<PublicVehicle[]> {
  const rows = await db.vehicle.findMany({
    where: { status: "LIVE", id: { not: v.id }, OR: [{ bodyType: v.bodyType }, { make: v.make }] },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((r) => toPublic(parseVehicle(r)));
}

export async function liveMakes(): Promise<string[]> {
  const rows = await db.vehicle.findMany({
    where: { status: "LIVE" },
    distinct: ["make"],
    select: { make: true },
    orderBy: { make: "asc" },
  });
  return rows.map((r) => r.make);
}
