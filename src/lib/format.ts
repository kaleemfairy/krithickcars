/** Indian-number formatting helpers (₹, Lakhs, lakh-grouped digits). */

const inr = new Intl.NumberFormat("en-IN");

/** 1450000 -> "14.50" */
export function toLakhs(rupees: number): string {
  return (rupees / 100_000).toFixed(2);
}

/** 1450000 -> "₹14.50 Lakhs" ; 9500000 -> "₹95.00 Lakhs" */
export function formatLakhs(rupees: number): string {
  return `₹${toLakhs(rupees)} Lakhs`;
}

/** 28400 -> "₹28,400" ; 1450000 -> "₹14,50,000" */
export function formatRupees(rupees: number): string {
  return `₹${inr.format(Math.round(rupees))}`;
}

/** 28400 -> "28,400 km" */
export function formatKm(km: number): string {
  return `${inr.format(km)} km`;
}

export function ordinalOwner(n: number): string {
  const s = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${s} Owner`;
}

/** Default financing assumptions used for the "Est. EMI" badge. */
export type EmiOptions = { ltv?: number; annualRatePct?: number; months?: number };
export const EMI_DEFAULTS = { ltv: 0.8, annualRatePct: 11.5, months: 60 } satisfies Required<EmiOptions>;

/** Standard reducing-balance EMI. Returns rupees per month. */
export function calcEmi(
  price: number,
  { ltv = EMI_DEFAULTS.ltv, annualRatePct = EMI_DEFAULTS.annualRatePct, months = EMI_DEFAULTS.months }: EmiOptions = {},
): number {
  const principal = price * ltv;
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

/** "TN09BU8812" / "tn 09 bu 8812" -> "TN 09 BU 8812" */
export function normalizeRegNumber(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = raw.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (!m) return input.toUpperCase().trim().replace(/\s+/g, " ");
  const [, st, rto, series, num] = m;
  return [st, rto.padStart(2, "0"), series, num.padStart(4, "0")].filter(Boolean).join(" ");
}

export const REG_NUMBER_PATTERN = /^[A-Z]{2} \d{2} [A-Z]{1,3} \d{4}$/;

/** "TN 09 BU 8812" -> "TN-09" */
export function rtoCode(reg: string): string {
  const m = reg.match(/^([A-Z]{2})\s?(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : "";
}

export function slugify(...parts: (string | number)[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
