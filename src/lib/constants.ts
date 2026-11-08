export const DEALER = {
  name: "Krithick Cars",
  tagline: "Affordable & Genuine Pre-Owned Cars @ Lowest Price",
  phoneDisplay: "+91 76039 60061",
  phoneE164: "+917603960061",
  whatsapp: "917603960061",
  address: "Grand Southern Trunk (GST) Road, Chennai, Tamil Nadu",
  hours: "Mon – Sun · 9:30 AM – 8:30 PM",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Krithick+Cars+GST+Road+Chennai",
} as const;

export const FUEL_TYPES = ["PETROL", "DIESEL", "EV", "HYBRID", "CNG"] as const;
export const TRANSMISSIONS = ["MANUAL", "AUTOMATIC"] as const;
export const BODY_TYPES = ["SUV", "SEDAN", "HATCHBACK", "MUV"] as const;
export const VEHICLE_STATUSES = ["DRAFT", "LIVE", "UNDER_INSPECTION", "BOOKED", "SOLD"] as const;
export const LEAD_CHANNELS = ["WHATSAPP", "CALL", "FORM"] as const;
export const LEAD_STATUSES = ["NEW", "CONTACTED", "TEST_DRIVE_SCHEDULED", "WON", "LOST"] as const;
export const LEAD_KINDS = ["ENQUIRY", "VALUATION", "TEST_DRIVE"] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const PHOTO_ANGLES = [
  { key: "front34", label: "Front 3/4" },
  { key: "rear", label: "Rear Profile" },
  { key: "cockpit", label: "Cockpit / Odometer" },
  { key: "engine", label: "Engine Bay" },
  { key: "tyres", label: "Tyres / Alloys" },
  { key: "interiorRear", label: "Interior Rear" },
] as const;
export type PhotoAngle = (typeof PHOTO_ANGLES)[number]["key"];

export const MAKES = [
  "Audi", "BMW", "Honda", "Hyundai", "Kia", "Mahindra", "Maruti Suzuki",
  "Mercedes-Benz", "MG", "Renault", "Skoda", "Tata", "Toyota", "Volkswagen",
] as const;

export const TN_RTO_OFFICES = [
  "TN-01 Chennai (Central)", "TN-02 Chennai (North West)", "TN-03 Chennai (North East)",
  "TN-04 Chennai (East)", "TN-05 Chennai (North)", "TN-06 Chennai (South East)",
  "TN-07 Chennai (South)", "TN-09 Chennai (West)", "TN-10 Chennai (Valasaravakkam)",
  "TN-11 Tambaram", "TN-12 Poonamallee", "TN-14 Sholinganallur", "TN-19 Chengalpattu",
  "TN-22 Meenambakkam", "TN-37 Coimbatore (South)", "TN-38 Coimbatore (North)",
  "TN-58 Madurai (South)", "TN-59 Madurai (North)",
] as const;

export const BUDGETS = [
  { key: "under10", label: "Under ₹10L", min: 0, max: 1_000_000 },
  { key: "10to25", label: "₹10L – ₹25L", min: 1_000_000, max: 2_500_000 },
  { key: "above25", label: "₹25L+", min: 2_500_000, max: Number.MAX_SAFE_INTEGER },
] as const;

export const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "year_desc", label: "Year: Newest" },
  { key: "km_asc", label: "KM: Lowest" },
] as const;

export const LABELS: Record<string, string> = {
  PETROL: "Petrol", DIESEL: "Diesel", EV: "Electric", HYBRID: "Hybrid", CNG: "CNG",
  MANUAL: "Manual", AUTOMATIC: "Automatic",
  SUV: "SUV", SEDAN: "Sedan", HATCHBACK: "Hatchback", MUV: "MUV",
  DRAFT: "Draft", LIVE: "Live", UNDER_INSPECTION: "Under Inspection", BOOKED: "Token Booked", SOLD: "Sold",
  NEW: "New", CONTACTED: "Contacted", TEST_DRIVE_SCHEDULED: "Test Drive Scheduled", WON: "Won", LOST: "Lost",
  WHATSAPP: "WhatsApp", CALL: "Call", FORM: "Web Form",
  ENQUIRY: "Enquiry", VALUATION: "Sell / Exchange", TEST_DRIVE: "Test Drive",
};
export const label = (v: string) => LABELS[v] ?? v;
