import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Records an anonymous WhatsApp enquiry click so staff can see demand per car.
 * The customer's details arrive in WhatsApp itself; staff fill them in later.
 */
export async function POST(req: Request) {
  let vehicleId: unknown;
  try {
    ({ vehicleId } = await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof vehicleId !== "string" || vehicleId.length > 40) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const v = await db.vehicle.findFirst({ where: { id: vehicleId, status: { in: ["LIVE", "BOOKED"] } }, select: { id: true } });
  if (!v) return NextResponse.json({ ok: false }, { status: 404 });

  // Coarse flood guard: at most 30 anonymous clicks per car per hour.
  const recent = await db.lead.count({
    where: { vehicleId: v.id, customerPhone: "", createdAt: { gte: new Date(Date.now() - 3_600_000) } },
  });
  if (recent < 30) {
    await db.lead.create({
      data: { vehicleId: v.id, customerName: "WhatsApp visitor", customerPhone: "", channel: "WHATSAPP", kind: "ENQUIRY", message: "Clicked “Enquire WhatsApp”" },
    });
  }
  return NextResponse.json({ ok: true });
}
