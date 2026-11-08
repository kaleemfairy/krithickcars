import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronLeft, Phone, ShieldCheck } from "lucide-react";
import { DEALER, label } from "@/lib/constants";
import { calcEmi, formatKm, formatLakhs, formatRupees, ordinalOwner } from "@/lib/format";
import { getPublicVehicle, getSimilarVehicles } from "@/lib/queries";
import { inspectionScore, orderedImages, vehicleTitle } from "@/lib/vehicle";
import { buildEnquiryMessage, dealerWhatsApp } from "@/lib/whatsapp";
import { EmiCalculator } from "@/components/showroom/EmiCalculator";
import { ImageCarousel } from "@/components/showroom/ImageCarousel";
import { TestDriveForm } from "@/components/showroom/TestDriveForm";
import { VehicleCard } from "@/components/showroom/VehicleCard";
import { WhatsAppLink } from "@/components/showroom/WhatsAppLink";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const v = await getPublicVehicle((await params).slug);
  if (!v) return { title: "Car not found" };
  return {
    title: `${vehicleTitle(v)} – ${formatLakhs(v.askingPrice)}`,
    description: `${vehicleTitle(v)}, ${formatKm(v.odometerKm)}, ${label(v.fuelType)} ${label(v.transmission)}, ${ordinalOwner(v.ownership)}. KC 160-point inspected.`,
  };
}

function Meter({ label: l, value, max = 100, suffix = "%" }: { label: string; value: number; max?: number; suffix?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span className="text-muted">{l}</span>
        <span>{value}{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-high" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={l}>
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function CarPage({ params }: PageProps<"/cars/[slug]">) {
  const v = await getPublicVehicle((await params).slug);
  if (!v) notFound();
  const similar = await getSimilarVehicles(v);
  const title = vehicleTitle(v);
  const insp = v.inspection;

  const specs: [string, string][] = [
    ["Registration year", String(v.year)],
    ["Odometer", formatKm(v.odometerKm)],
    ["Fuel", label(v.fuelType)],
    ["Transmission", label(v.transmission)],
    ["Body type", label(v.bodyType)],
    ["Ownership", ordinalOwner(v.ownership)],
    ["Registration", v.regNumber],
    ["RTO", v.rtoOffice],
    ["Exterior colour", v.exteriorColor],
    ["Interior", v.interior || "—"],
    ["Insurance", v.insurance ? `${v.insurance}${v.insuranceExpiry ? ` · till ${v.insuranceExpiry.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}` : "—"],
    ["Service history", v.serviceHistory || "—"],
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <Link href="/#inventory" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-gold-deep">
        <ChevronLeft size={16} /> Back to inventory
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <ImageCarousel images={orderedImages(v.images)} alt={title} className="h-64 rounded-2xl sm:h-96 lg:h-[460px]" showThumbs>
            {v.isCertified && (
              <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1 rounded bg-gold px-2.5 py-1 text-xs font-bold text-gold-ink">
                <BadgeCheck size={14} /> KC Certified · 160-Point
              </span>
            )}
          </ImageCarousel>

          <section className="card mt-6 p-5 md:p-6">
            <h2 className="mb-4 text-lg font-bold">Full Specifications</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {specs.map(([k, val]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line-soft py-2.5 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-semibold">{val}</dd>
                </div>
              ))}
            </dl>
            {v.highlights && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {v.highlights.split("•").map((h) => h.trim()).filter(Boolean).map((h) => (
                  <li key={h} className="rounded-full border border-line bg-surface-low px-3 py-1 text-xs font-semibold">{h}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="card mt-6 p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="text-gold-deep" /> 160-Point Inspection Summary</h2>
              <span className="rounded-full bg-onyx px-3 py-1 text-sm font-bold text-gold-pale">Score {inspectionScore(insp)}/100</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Meter label="Engine & compression" value={insp.engineGrade} max={10} suffix="/10" />
              <Meter label="Transmission" value={insp.transmissionGrade} max={10} suffix="/10" />
              <Meter label="Suspension" value={insp.suspensionPct} />
              <Meter label="Tyre life" value={insp.tyreLifePct} />
              <Meter label="Brakes" value={insp.brakePct} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              {insp.nonAccidental && <span className="rounded bg-whatsapp/10 px-2.5 py-1 text-whatsapp-dark">✓ Non-accidental certified</span>}
              {insp.floodFree && <span className="rounded bg-whatsapp/10 px-2.5 py-1 text-whatsapp-dark">✓ Flood-free verified</span>}
            </div>
            <WhatsAppLink
              href={dealerWhatsApp(buildEnquiryMessage(v))}
              vehicleId={v.id}
              className="btn-outline mt-5 w-full sm:w-auto"
            >
              Request full inspection PDF
            </WhatsAppLink>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 md:p-6">
            <p className="eyebrow text-subtle">{v.make}</p>
            <h1 className="font-display text-3xl font-semibold leading-tight">{v.year} {v.model} <span className="text-muted">{v.variant}</span></h1>
            <p className="mt-1 text-sm text-muted">{formatKm(v.odometerKm)} · {label(v.fuelType)} · {label(v.transmission)} · {ordinalOwner(v.ownership)}</p>
            {v.status === "BOOKED" && <p className="mt-3 rounded bg-danger/10 px-3 py-2 text-sm font-bold text-danger">Token booked — join the waitlist on WhatsApp</p>}
            <div className="mt-4 border-t border-line-soft pt-4">
              <p className="font-display text-4xl font-bold text-gold-deep">{formatLakhs(v.askingPrice)}</p>
              <p className="text-sm text-muted">{formatRupees(v.askingPrice)} · EMI from {formatRupees(calcEmi(v.askingPrice))}/mo*</p>
            </div>
            <div className="mt-5 grid gap-2">
              <WhatsAppLink href={dealerWhatsApp(v)} vehicleId={v.id} className="btn-wa py-3">Enquire on WhatsApp</WhatsAppLink>
              <a href={`tel:${DEALER.phoneE164}`} className="btn-outline py-3"><Phone size={18} /> Call {DEALER.phoneDisplay}</a>
            </div>
          </div>
          <TestDriveForm vehicleId={v.id} />
          <EmiCalculator price={v.askingPrice} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl font-semibold">You may also like</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => <VehicleCard key={s.id} v={s} />)}
          </div>
        </section>
      )}
    </main>
  );
}
