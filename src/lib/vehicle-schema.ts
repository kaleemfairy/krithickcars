import { z } from "zod";
import { BODY_TYPES, FUEL_TYPES, PHOTO_ANGLES, TRANSMISSIONS } from "./constants";
import { REG_NUMBER_PATTERN, normalizeRegNumber } from "./format";

const angleKeys = PHOTO_ANGLES.map((a) => a.key) as [string, ...string[]];

export const imageSchema = z.object({
  angle: z.enum([...angleKeys, "extra"]),
  url: z.string().refine((u) => u.startsWith("/api/uploads/") || /^https:\/\//.test(u), "Invalid image URL"),
});

export const inspectionSchema = z.object({
  engineGrade: z.coerce.number().min(0).max(10),
  transmissionGrade: z.coerce.number().min(0).max(10),
  suspensionPct: z.coerce.number().min(0).max(100),
  tyreLifePct: z.coerce.number().min(0).max(100),
  brakePct: z.coerce.number().min(0).max(100),
  nonAccidental: z.boolean(),
  floodFree: z.boolean(),
  notes: z.string().max(2000),
  inspectedBy: z.string().max(80),
});

/** Treat "" (empty input) as missing so the "required" message shows instead of a min() error. */
const num = (required: string) =>
  z.preprocess((x) => (x === "" || x === null ? undefined : x), z.coerce.number({ message: required }));
const rupees = (msg: string) => num(msg).pipe(z.number().int().min(50_000, "Price looks too low").max(50_00_00_000));

/** Fields every draft needs (enough to identify the car). */
const base = z.object({
  make: z.string().trim().min(2, "Select a brand"),
  model: z.string().trim().min(1, "Enter the model").max(40),
  variant: z.string().trim().max(60).default(""),
  year: num("Select the registration year").pipe(z.number().int().min(1995).max(new Date().getFullYear() + 1)),
  regNumber: z
    .string()
    .transform(normalizeRegNumber)
    .refine((r) => REG_NUMBER_PATTERN.test(r), "Use the format TN 09 CE 9900"),
  rtoOffice: z.string().trim().max(60).default(""),
  ownership: z.coerce.number().int().min(1).max(6),
  odometerKm: num("Enter the odometer reading").pipe(z.number().int().min(0, "Odometer can't be negative").max(999_999)),
  fuelType: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  bodyType: z.enum(BODY_TYPES),
  exteriorColor: z.string().trim().max(60).default(""),
  interior: z.string().trim().max(200).default(""),
  insurance: z.string().trim().max(60).default(""),
  insuranceExpiry: z
    .string()
    .optional()
    .transform((s) => (s ? new Date(s) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Invalid date"),
  serviceHistory: z.string().trim().max(1000).default(""),
  highlights: z.string().trim().max(300).default(""),
  askingPrice: rupees("Enter the asking price"),
  floorPrice: rupees("Enter the floor price"),
  isCertified: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(imageSchema).max(20),
  inspection: inspectionSchema,
});

export const draftVehicleSchema = base.refine((v) => v.floorPrice <= v.askingPrice, {
  path: ["floorPrice"],
  message: "Floor price must be at or below the asking price",
});

/** Publishing live additionally requires all six mandatory angles and a sign-off. */
export const publishVehicleSchema = draftVehicleSchema
  .refine((v) => PHOTO_ANGLES.every((a) => v.images.some((i) => i.angle === a.key)), {
    path: ["images"],
    message: "Upload all 6 mandatory angles before publishing",
  })
  .refine((v) => !v.isCertified || v.inspection.nonAccidental, {
    path: ["inspection", "nonAccidental"],
    message: "KC Certified cars need the non-accidental sign-off",
  })
  .refine((v) => v.rtoOffice.length > 0, { path: ["rtoOffice"], message: "Select the RTO office" })
  .refine((v) => v.exteriorColor.length > 0, { path: ["exteriorColor"], message: "Enter the exterior colour" });

export type VehicleInput = z.input<typeof base>;
