import { DEALER } from "./constants";
import { toLakhs } from "./format";

export type WhatsAppVehicle = {
  year: number;
  make: string;
  model: string;
  variant: string;
  regNumber: string;
  askingPrice: number; // rupees
};

/**
 * Normalise an Indian phone number into the digits-only international form
 * that wa.me expects: "+91 76039-60061" / "07603960061" / "7603960061" -> "917603960061".
 */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  if (!/^91[6-9]\d{9}$/.test(digits)) {
    throw new Error(`Not a valid Indian mobile number: "${phone}"`);
  }
  return digits;
}

export function buildEnquiryMessage(v: WhatsAppVehicle): string {
  const name = [v.year, v.make, v.model, v.variant].filter(Boolean).join(" ");
  return (
    `Hello Krithick Cars! I am interested in the verified ${name} (${v.regNumber}) ` +
    `listed at ₹${toLakhs(v.askingPrice)} Lakhs. ` +
    `Please share the 160-point inspection PDF and schedule a test drive.`
  );
}

/** wa.me deep link with a URL-encoded, pre-filled message. */
export function buildWhatsAppUrl(phone: string, vehicle?: WhatsAppVehicle | null, text?: string): string {
  const number = toWhatsAppNumber(phone);
  const message = text ?? (vehicle ? buildEnquiryMessage(vehicle) : "");
  return message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`;
}

/** Convenience: link to the dealership's own WhatsApp. */
export function dealerWhatsApp(textOrVehicle?: string | WhatsAppVehicle): string {
  return typeof textOrVehicle === "string"
    ? buildWhatsAppUrl(DEALER.whatsapp, null, textOrVehicle)
    : buildWhatsAppUrl(DEALER.whatsapp, textOrVehicle ?? null);
}
