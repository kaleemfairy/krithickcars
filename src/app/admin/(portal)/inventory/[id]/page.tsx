import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { VehicleForm, type VehicleFormValues } from "@/components/admin/VehicleForm";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { PHOTO_ANGLES } from "@/lib/constants";
import { db } from "@/lib/db";
import { parseVehicle, vehicleTitle } from "@/lib/vehicle";

export const metadata = { title: "Edit Vehicle" };

export default async function EditVehiclePage({ params, searchParams }: PageProps<"/admin/inventory/[id]">) {
  const { id } = await params;
  const saved = (await searchParams).saved;
  const row = await db.vehicle.findUnique({ where: { id } });
  if (!row) notFound();
  const v = parseVehicle(row);

  const initial: VehicleFormValues = {
    make: v.make, model: v.model, variant: v.variant, year: v.year, regNumber: v.regNumber, rtoOffice: v.rtoOffice,
    ownership: v.ownership, odometerKm: v.odometerKm, fuelType: v.fuelType, transmission: v.transmission,
    bodyType: v.bodyType, exteriorColor: v.exteriorColor, interior: v.interior, insurance: v.insurance,
    insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.toISOString().slice(0, 10) : "",
    serviceHistory: v.serviceHistory, highlights: v.highlights, askingPrice: v.askingPrice, floorPrice: v.floorPrice,
    isCertified: v.isCertified, isFeatured: v.isFeatured, images: v.images, inspection: v.inspection,
  };
  const canGoLive = PHOTO_ANGLES.every((a) => v.images.some((i) => i.angle === a.key));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep">Edit Listing</p>
          <h1 className="font-display text-3xl font-semibold">{vehicleTitle(v)}</h1>
          <p className="mt-1 text-sm text-muted">{v.regNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusSelect id={v.id} status={v.status} canGoLive={canGoLive} />
          {(v.status === "LIVE" || v.status === "BOOKED") && (
            <Link href={`/cars/${v.slug}`} target="_blank" className="btn-outline text-xs"><ExternalLink size={14} /> View on showroom</Link>
          )}
        </div>
      </div>
      {saved && (
        <p role="status" className="rounded-xl bg-whatsapp/12 px-4 py-3 text-sm font-bold text-whatsapp-dark">
          {saved === "publish" ? "Published live to the showroom." : "Draft saved."}
        </p>
      )}
      <VehicleForm initial={initial} id={v.id} currentStatus={v.status} />
    </div>
  );
}
