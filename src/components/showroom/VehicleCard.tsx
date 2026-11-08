import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { label } from "@/lib/constants";
import { calcEmi, formatKm, formatLakhs, formatRupees, ordinalOwner, rtoCode } from "@/lib/format";
import { orderedImages, vehicleTitle, type PublicVehicle } from "@/lib/vehicle";
import { dealerWhatsApp } from "@/lib/whatsapp";
import { ImageCarousel } from "./ImageCarousel";
import { WhatsAppLink } from "./WhatsAppLink";

export function SpecPill({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded bg-surface-low px-1.5 py-1.5 text-center">
      <span className="block text-[9px] font-bold tracking-[0.1em] text-subtle">{k}</span>
      <span className="block truncate text-xs font-bold text-ink">{v}</span>
    </div>
  );
}

export function VehicleCard({ v }: { v: PublicVehicle }) {
  const title = vehicleTitle(v);
  const emi = calcEmi(v.askingPrice);
  const booked = v.status === "BOOKED";

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:border-gold hover:shadow-md">
      <ImageCarousel images={orderedImages(v.images)} alt={title} className="h-56">
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded border border-gold/40 bg-onyx/85 px-2 py-0.5 text-[10px] font-bold text-gold-pale backdrop-blur">
            {ordinalOwner(v.ownership)}
          </span>
          {v.isCertified && (
            <span className="flex items-center gap-1 rounded bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-ink">
              <BadgeCheck size={12} /> KC Certified
            </span>
          )}
          {booked && <span className="rounded bg-danger px-2 py-0.5 text-[10px] font-bold text-white">Token Booked</span>}
        </div>
      </ImageCarousel>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div>
          <Link href={`/cars/${v.slug}`} className="hover:text-gold-deep">
            <h3 className="font-display text-xl font-semibold leading-snug">
              {v.year} {v.make} {v.model} <span className="text-muted">{v.variant}</span>
            </h3>
          </Link>
          {v.highlights && <p className="mt-1 line-clamp-1 text-xs text-muted">{v.highlights}</p>}
          <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-line-soft pt-3">
            <SpecPill k="YEAR" v={String(v.year)} />
            <SpecPill k="KM" v={formatKm(v.odometerKm)} />
            <SpecPill k="FUEL" v={label(v.fuelType)} />
            <SpecPill k="GEAR" v={label(v.transmission)} />
            <SpecPill k="OWNER" v={ordinalOwner(v.ownership)} />
            <SpecPill k="RTO" v={rtoCode(v.regNumber)} />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line-soft pt-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="font-display text-2xl font-bold text-gold-deep">{formatLakhs(v.askingPrice)}</span>
              <span className="mt-0.5 block w-fit rounded bg-whatsapp/10 px-1.5 py-0.5 text-[11px] font-bold text-whatsapp-dark">
                EMI from {formatRupees(emi)}/mo*
              </span>
            </div>
            <span className="rounded border border-line px-2 py-0.5 text-[10px] font-bold tracking-wide text-subtle">
              {v.regNumber}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/cars/${v.slug}`} className="btn-outline px-2 text-xs">View Full Specs</Link>
            <WhatsAppLink href={dealerWhatsApp(v)} vehicleId={v.id} className="btn-wa px-2 text-xs" iconSize={16}>
              Enquire WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </article>
  );
}
