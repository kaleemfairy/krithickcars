/**
 * Demo inventory, leads and staff login.
 *
 *   npm run db:seed        RESET: wipes vehicles + leads, reloads demo data, (re)sets the staff password.
 *   npm run db:bootstrap   SAFE (used on every Vercel deploy): creates the staff login only if it
 *                          doesn't exist, and loads demo cars only if there are no vehicles at all.
 *
 * Staff login comes from ADMIN_EMAIL / ADMIN_PASSWORD (see .env.example).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import img from "../src/data/design-images.json";

const bootstrap = process.argv.includes("--bootstrap");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL }) });

const L = (lakhs: number) => Math.round(lakhs * 100_000);
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

// Generic detail shots from the design mock-ups, used as stand-ins until real photos are uploaded.
const detailAngles = [
  { angle: "rear", url: img.rear },
  { angle: "cockpit", url: img.cluster },
  { angle: "engine", url: img.engine },
  { angle: "tyres", url: img.alloy },
  { angle: "interiorRear", url: img.interior },
];

type Seed = {
  slug: string; make: string; model: string; variant: string; year: number; regNumber: string;
  rtoOffice: string; odometerKm: number; fuelType: string; transmission: string; bodyType: string;
  exteriorColor: string; interior: string; ownership: number; insurance: string; insuranceExpiry: Date;
  serviceHistory: string; highlights: string; askingPrice: number; floorPrice: number; status: string;
  isCertified: boolean; isFeatured?: boolean; images: { angle: string; url: string }[];
  inspection: Record<string, unknown>; createdAt: Date; soldAt?: Date;
};

const vehicles: Seed[] = [
  {
    slug: "2021-hyundai-creta-sx-o-turbo-tn09bu8812",
    make: "Hyundai", model: "Creta", variant: "SX (O) 1.4 Turbo DCT", year: 2021,
    regNumber: "TN 09 BU 8812", rtoOffice: "TN-09 Chennai (West)", odometerKm: 28_400,
    fuelType: "PETROL", transmission: "AUTOMATIC", bodyType: "SUV", exteriorColor: "Polar White",
    interior: "Black & Beige leatherette · Ventilated front seats", ownership: 1,
    insurance: "Comprehensive", insuranceExpiry: new Date("2027-03-14"),
    serviceHistory: "All 5 services at Hyundai authorised dealer (Kun Hyundai, Vadapalani).",
    highlights: "1.4L Turbo DCT • Panoramic Sunroof • Ventilated Seats • Bose Audio",
    askingPrice: L(14.5), floorPrice: L(13.85), status: "LIVE", isCertified: true, isFeatured: true,
    images: [{ angle: "front34", url: img.creta }, ...detailAngles],
    inspection: { engineGrade: 9, transmissionGrade: 9, suspensionPct: 92, tyreLifePct: 85, brakePct: 90, nonAccidental: true, floodFree: true, inspectedBy: "R. Senthil", notes: "Original paint on all panels. Fresh service done." },
    createdAt: daysAgo(3),
  },
  {
    slug: "2019-bmw-320d-luxury-line-tn07de9900",
    make: "BMW", model: "320d", variant: "Luxury Line", year: 2019,
    regNumber: "TN 07 DE 9900", rtoOffice: "TN-07 Chennai (South)", odometerKm: 49_000,
    fuelType: "DIESEL", transmission: "AUTOMATIC", bodyType: "SEDAN", exteriorColor: "Black Sapphire",
    interior: "Cognac Dakota leather · Harman Kardon", ownership: 2,
    insurance: "Comprehensive + Zero Dep", insuranceExpiry: new Date("2026-12-30"),
    serviceHistory: "BMW KUN Exclusive service records. BSI package valid till 2026.",
    highlights: "TwinPower Turbo Diesel • Cognac Leather • Harman Kardon • 8-Speed Steptronic",
    askingPrice: L(24.8), floorPrice: L(23.6), status: "LIVE", isCertified: true,
    images: [{ angle: "front34", url: img.bmw }, ...detailAngles],
    inspection: { engineGrade: 8, transmissionGrade: 9, suspensionPct: 84, tyreLifePct: 70, brakePct: 78, nonAccidental: true, floodFree: true, inspectedBy: "R. Senthil", notes: "Minor bumper touch-up (rear). No structural repair." },
    createdAt: daysAgo(8),
  },
  {
    slug: "2020-honda-city-zx-cvt-tn02ce4401",
    make: "Honda", model: "City", variant: "ZX CVT", year: 2020,
    regNumber: "TN 02 CE 4401", rtoOffice: "TN-02 Chennai (North West)", odometerKm: 34_100,
    fuelType: "PETROL", transmission: "AUTOMATIC", bodyType: "SEDAN", exteriorColor: "Lunar Silver",
    interior: "Beige leatherette · Sunroof", ownership: 1,
    insurance: "Comprehensive", insuranceExpiry: new Date("2027-01-20"),
    serviceHistory: "Full Honda company service record (Ramani Honda).",
    highlights: "1.5L i-VTEC • Sunroof • LaneWatch Camera • Full Honda Service Record",
    askingPrice: L(11.25), floorPrice: L(10.7), status: "LIVE", isCertified: true,
    images: [{ angle: "front34", url: img.city }, ...detailAngles],
    inspection: { engineGrade: 9, transmissionGrade: 8, suspensionPct: 88, tyreLifePct: 80, brakePct: 85, nonAccidental: true, floodFree: true, inspectedBy: "M. Karthik", notes: "" },
    createdAt: daysAgo(12),
  },
  {
    slug: "2022-maruti-suzuki-swift-zxi-plus-tn10ax3122",
    make: "Maruti Suzuki", model: "Swift", variant: "ZXi+ Dual Tone", year: 2022,
    regNumber: "TN 10 AX 3122", rtoOffice: "TN-10 Chennai (Valasaravakkam)", odometerKm: 18_200,
    fuelType: "PETROL", transmission: "MANUAL", bodyType: "HATCHBACK", exteriorColor: "Solid Fire Red / Black roof",
    interior: "Black fabric · Touchscreen infotainment", ownership: 1,
    insurance: "Zero Dep", insuranceExpiry: new Date("2027-06-02"),
    serviceHistory: "Maruti Arena authorised service, 3 free services completed.",
    highlights: "1.2L DualJet • Dual-Tone • SmartPlay Touchscreen • Cruise Control",
    askingPrice: L(7.45), floorPrice: L(7.1), status: "LIVE", isCertified: true,
    images: [{ angle: "front34", url: img.swift }, ...detailAngles],
    inspection: { engineGrade: 10, transmissionGrade: 9, suspensionPct: 95, tyreLifePct: 88, brakePct: 92, nonAccidental: true, floodFree: true, inspectedBy: "M. Karthik", notes: "" },
    createdAt: daysAgo(1),
  },
  {
    slug: "2021-mahindra-xuv700-ax7-diesel-at-tn22dk5570",
    make: "Mahindra", model: "XUV700", variant: "AX7 Diesel AT", year: 2021,
    regNumber: "TN 22 DK 5570", rtoOffice: "TN-22 Meenambakkam", odometerKm: 32_500,
    fuelType: "DIESEL", transmission: "AUTOMATIC", bodyType: "SUV", exteriorColor: "Midnight Black",
    interior: "Black leatherette · 7 seater · Dual screen cockpit", ownership: 1,
    insurance: "Comprehensive", insuranceExpiry: new Date("2026-11-25"),
    serviceHistory: "Mahindra authorised service, last at 30,000 km.",
    highlights: "2.2L mHawk AT • ADAS Pack • Dual Screen Cockpit • Sony 3D Audio",
    askingPrice: L(19.75), floorPrice: L(18.9), status: "LIVE", isCertified: true,
    images: [{ angle: "front34", url: img.xuv }, ...detailAngles],
    inspection: { engineGrade: 9, transmissionGrade: 9, suspensionPct: 86, tyreLifePct: 72, brakePct: 84, nonAccidental: true, floodFree: true, inspectedBy: "R. Senthil", notes: "" },
    createdAt: daysAgo(5),
  },
  {
    slug: "2023-toyota-fortuner-legender-4x4-at-tn14ef7007",
    make: "Toyota", model: "Fortuner", variant: "Legender 4x4 AT", year: 2023,
    regNumber: "TN 14 EF 7007", rtoOffice: "TN-14 Sholinganallur", odometerKm: 21_800,
    fuelType: "DIESEL", transmission: "AUTOMATIC", bodyType: "SUV", exteriorColor: "Pearl White / Black roof",
    interior: "Black & Maroon leather · Wireless charging", ownership: 1,
    insurance: "Comprehensive + Zero Dep", insuranceExpiry: new Date("2027-08-11"),
    serviceHistory: "Toyota authorised service (Lanson Toyota). Extended warranty till 2028.",
    highlights: "2.8L GD 4x4 AT • Dual-Tone Legender • Ventilated Seats • JBL Audio",
    askingPrice: L(46.9), floorPrice: L(45.25), status: "LIVE", isCertified: true,
    images: [{ angle: "front34", url: img.fortuner }, ...detailAngles],
    inspection: { engineGrade: 10, transmissionGrade: 10, suspensionPct: 94, tyreLifePct: 90, brakePct: 93, nonAccidental: true, floodFree: true, inspectedBy: "R. Senthil", notes: "Showroom condition." },
    createdAt: daysAgo(2),
  },
  // --- Admin-only stock (not LIVE) so the dashboard has every status ---
  {
    slug: "2020-mercedes-benz-e-class-e220d-tn09cz1212",
    make: "Mercedes-Benz", model: "E-Class", variant: "E 220d Exclusive", year: 2020,
    regNumber: "TN 09 CZ 1212", rtoOffice: "TN-09 Chennai (West)", odometerKm: 41_300,
    fuelType: "DIESEL", transmission: "AUTOMATIC", bodyType: "SEDAN", exteriorColor: "Obsidian Black",
    interior: "Macchiato beige Nappa", ownership: 1,
    insurance: "Comprehensive", insuranceExpiry: new Date("2027-02-01"),
    serviceHistory: "Mercedes authorised service.", highlights: "E 220d • LWB • Burmester • Ambient lighting",
    askingPrice: L(42.5), floorPrice: L(40.75), status: "SOLD", isCertified: true,
    images: [{ angle: "front34", url: img.eclass }, ...detailAngles],
    inspection: { engineGrade: 9, transmissionGrade: 9, suspensionPct: 88, tyreLifePct: 80, brakePct: 85, nonAccidental: true, floodFree: true, inspectedBy: "R. Senthil", notes: "" },
    createdAt: daysAgo(30), soldAt: daysAgo(4),
  },
  {
    slug: "2021-audi-q7-technology-tn07dh4545",
    make: "Audi", model: "Q7", variant: "45 TFSI Technology", year: 2021,
    regNumber: "TN 07 DH 4545", rtoOffice: "TN-07 Chennai (South)", odometerKm: 36_900,
    fuelType: "PETROL", transmission: "AUTOMATIC", bodyType: "SUV", exteriorColor: "Navarra Blue",
    interior: "Okapi brown Valcona leather", ownership: 1,
    insurance: "Comprehensive", insuranceExpiry: new Date("2027-04-18"),
    serviceHistory: "Audi authorised service.", highlights: "3.0 TFSI quattro • Matrix LED • B&O Audio • 7 seater",
    askingPrice: L(58.0), floorPrice: L(55.5), status: "BOOKED", isCertified: true,
    images: [{ angle: "front34", url: img.q7 }, ...detailAngles],
    inspection: { engineGrade: 9, transmissionGrade: 9, suspensionPct: 85, tyreLifePct: 76, brakePct: 82, nonAccidental: true, floodFree: true, inspectedBy: "M. Karthik", notes: "" },
    createdAt: daysAgo(14),
  },
  {
    slug: "2020-tata-nexon-xz-plus-tn11bk2020",
    make: "Tata", model: "Nexon", variant: "XZ+ Petrol", year: 2020,
    regNumber: "TN 11 BK 2020", rtoOffice: "TN-11 Tambaram", odometerKm: 44_700,
    fuelType: "PETROL", transmission: "MANUAL", bodyType: "SUV", exteriorColor: "Foliage Green",
    interior: "Black fabric", ownership: 2,
    insurance: "Third party", insuranceExpiry: new Date("2026-12-05"),
    serviceHistory: "Mixed authorised / independent.", highlights: "1.2L Revotron Turbo • 5-Star GNCAP • Harman Audio",
    askingPrice: L(7.95), floorPrice: L(7.4), status: "UNDER_INSPECTION", isCertified: false,
    images: [{ angle: "front34", url: img.nexon }, ...detailAngles],
    inspection: { engineGrade: 7, transmissionGrade: 8, suspensionPct: 70, tyreLifePct: 55, brakePct: 65, nonAccidental: false, floodFree: true, inspectedBy: "", notes: "Awaiting tyre replacement before sign-off." },
    createdAt: daysAgo(0),
  },
];

async function ensureStaff() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@krithickcars.in").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (bootstrap) return console.log("ADMIN_PASSWORD not set — skipping staff login.");
    throw new Error("Set ADMIN_PASSWORD in .env before seeding (see .env.example).");
  }
  const existing = await db.staffUser.findUnique({ where: { email } });
  if (existing && bootstrap) return console.log(`Staff user ${email} already exists.`);
  const passwordHash = await bcrypt.hash(password, 10);
  await db.staffUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Showroom Manager", passwordHash },
  });
  console.log(`Staff user ${email} ready.`);
}

async function main() {
  await ensureStaff();
  if (bootstrap) {
    if (process.env.SEED_DEMO_DATA === "false") return console.log("SEED_DEMO_DATA=false — no demo cars.");
    if ((await db.vehicle.count()) > 0) return console.log("Inventory already present — leaving it alone.");
  } else {
    await db.lead.deleteMany();
    await db.vehicle.deleteMany();
  }

  const bySlug: Record<string, string> = {};
  for (const v of vehicles) {
    const row = await db.vehicle.create({
      data: { ...v, images: JSON.stringify(v.images), inspection: JSON.stringify(v.inspection), isFeatured: v.isFeatured ?? false },
    });
    bySlug[v.model] = row.id;
  }

  const leads = [
    { vehicleId: bySlug["Creta"], customerName: "Arun Prakash", customerPhone: "+91 98400 11223", channel: "WHATSAPP", kind: "ENQUIRY", status: "NEW", createdAt: daysAgo(0) },
    { vehicleId: bySlug["Fortuner"], customerName: "Lakshmi Narayanan", customerPhone: "+91 99620 44556", channel: "WHATSAPP", kind: "TEST_DRIVE", status: "TEST_DRIVE_SCHEDULED", createdAt: daysAgo(1) },
    { vehicleId: bySlug["320d"], customerName: "Fathima Begum", customerPhone: "+91 90031 77889", channel: "CALL", kind: "ENQUIRY", status: "CONTACTED", createdAt: daysAgo(2) },
    { vehicleId: bySlug["Swift"], customerName: "Vignesh R", customerPhone: "+91 97910 22334", channel: "WHATSAPP", kind: "ENQUIRY", status: "NEW", createdAt: daysAgo(0) },
    { vehicleId: null, customerName: "Suresh Kumar", customerPhone: "+91 94440 55667", channel: "FORM", kind: "VALUATION", status: "NEW", message: "Hyundai i20 Asta · 2018 · TN 12 AB 4321", createdAt: daysAgo(1) },
    { vehicleId: bySlug["E-Class"], customerName: "Dr. Meenakshi S", customerPhone: "+91 98410 99887", channel: "WHATSAPP", kind: "ENQUIRY", status: "WON", createdAt: daysAgo(9) },
  ];
  // Sample leads are demo-only; a real showroom's first deploy starts with an empty CRM.
  if (!bootstrap) for (const l of leads) await db.lead.create({ data: { message: "", ...l } });

  console.log(`Seeded ${vehicles.length} vehicles${bootstrap ? "" : ` and ${leads.length} leads`}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
