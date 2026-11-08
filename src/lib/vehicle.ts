import type { Vehicle as VehicleRow } from "@/generated/prisma/client";
import { PHOTO_ANGLES, type PhotoAngle } from "./constants";

export type VehicleImage = { angle: PhotoAngle | "extra"; url: string };

export type Inspection = {
  engineGrade: number; // 0–10
  transmissionGrade: number; // 0–10
  suspensionPct: number; // 0–100
  tyreLifePct: number; // 0–100
  brakePct: number; // 0–100
  nonAccidental: boolean;
  floodFree: boolean;
  notes: string;
  inspectedBy: string;
};

export const EMPTY_INSPECTION: Inspection = {
  engineGrade: 8,
  transmissionGrade: 8,
  suspensionPct: 80,
  tyreLifePct: 75,
  brakePct: 80,
  nonAccidental: false,
  floodFree: false,
  notes: "",
  inspectedBy: "",
};

/** Vehicle as used by the UI: JSON columns parsed. */
export type Vehicle = Omit<VehicleRow, "images" | "inspection"> & {
  images: VehicleImage[];
  inspection: Inspection;
};

/** Public-safe projection: never ships floorPrice to the browser. */
export type PublicVehicle = Omit<Vehicle, "floorPrice">;

function safeJson<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function parseVehicle(row: VehicleRow): Vehicle {
  return {
    ...row,
    images: safeJson<VehicleImage[]>(row.images, []),
    inspection: { ...EMPTY_INSPECTION, ...safeJson<Partial<Inspection>>(row.inspection, {}) },
  };
}

export function toPublic(v: Vehicle): PublicVehicle {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { floorPrice, ...rest } = v;
  return rest;
}

export function vehicleTitle(v: Pick<Vehicle, "year" | "make" | "model" | "variant">) {
  return `${v.year} ${v.make} ${v.model} ${v.variant}`.trim();
}

/** Images ordered by the canonical angle order, extras last. */
export function orderedImages(images: VehicleImage[]): VehicleImage[] {
  const order = PHOTO_ANGLES.map((a) => a.key as string);
  return [...images].sort((a, b) => {
    const ia = order.indexOf(a.angle);
    const ib = order.indexOf(b.angle);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export function coverImage(v: Pick<Vehicle, "images">): string {
  return orderedImages(v.images)[0]?.url ?? "/placeholder-car.svg";
}

export function inspectionScore(i: Inspection): number {
  const parts = [
    i.engineGrade * 10,
    i.transmissionGrade * 10,
    i.suspensionPct,
    i.tyreLifePct,
    i.brakePct,
    i.nonAccidental ? 100 : 0,
  ];
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
