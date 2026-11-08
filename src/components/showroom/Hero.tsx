import Link from "next/link";
import { Phone, ShieldCheck } from "lucide-react";
import { DEALER, label } from "@/lib/constants";
import { formatKm, formatLakhs, ordinalOwner } from "@/lib/format";
import { coverImage, vehicleTitle, type PublicVehicle } from "@/lib/vehicle";
import { dealerWhatsApp } from "@/lib/whatsapp";
import { CarImage } from "./CarImage";
import { WhatsAppLink } from "./WhatsAppLink";

const STATS = [
  { k: "100%", v: "Verified Quality" },
  { k: "0 Accidents", v: "Guarantee Seal" },
  { k: "Instant", v: "RC Transfer" },
  { k: "Lowest", v: "Price Promise" },
];

export function Hero({ featured }: { featured: PublicVehicle | null }) {
  const testDriveText = featured
    ? `Hello Krithick Cars! I would like to book a priority test drive for the ${vehicleTitle(featured)} (${featured.regNumber}) listed at ${formatLakhs(featured.askingPrice)}. Please share available slots.`
    : "";

  return (
    <section className="relative overflow-hidden bg-onyx text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero-showroom.webp)" }}
      />
      {/* Darken the left for legible copy; keep the showroom glow visible on the right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-onyx/80 via-onyx/70 to-onyx/90 lg:bg-gradient-to-r lg:from-onyx/90 lg:via-onyx/60 lg:to-onyx/40"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-onyx to-transparent" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-10 md:px-8 lg:grid-cols-12 lg:pb-24 lg:pt-16">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-wide text-gold-pale">
            <ShieldCheck size={14} /> 100% Non-Accidental Guarantee · Verified RC Documents
          </span>
          <h1 className="font-display text-[34px] leading-[1.15] font-bold tracking-tight md:text-5xl md:leading-[1.12]">
            Affordable &amp; Genuine <br className="hidden sm:block" />
            <span className="italic text-gold">Pre-Owned Cars</span> @ Lowest Price
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/70">
            Handpicked, rigorously inspected family and luxury cars — every one with a clear service history and
            hassle-free RC transfer across Chennai and Tamil Nadu.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href={`tel:${DEALER.phoneE164}`} className="btn-gold px-5 py-3">
              <Phone size={18} /> Call {DEALER.phoneDisplay}
            </a>
            <WhatsAppLink
              href={dealerWhatsApp("Hi Krithick Cars, please share the latest available cars catalogue.")}
              className="btn-wa px-5 py-3"
            >
              Chat with an Inventory Specialist
            </WhatsAppLink>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.v}>
                <dt className="text-lg font-bold text-gold-pale">{s.k}</dt>
                <dd className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {featured && (
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-gradient-to-tr from-gold/50 via-white/10 to-gold/60 p-px shadow-2xl">
              <article className="flex flex-col gap-3 rounded-2xl bg-graphite p-4">
                <Link href={`/cars/${featured.slug}`} className="relative block h-56 overflow-hidden rounded-xl md:h-64">
                  <CarImage src={coverImage(featured)} alt={vehicleTitle(featured)} className="h-full w-full" />
                  <span className="absolute left-3 top-3 rounded border border-gold/50 bg-onyx/85 px-2.5 py-1 text-[11px] font-bold text-gold-pale backdrop-blur">
                    Spotlight Deal of the Week
                  </span>
                  <span className="absolute bottom-3 right-3 rounded bg-gold px-3 py-1 text-lg font-bold text-gold-ink shadow">
                    {formatLakhs(featured.askingPrice)}
                  </span>
                </Link>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">
                      {featured.year} {featured.make} {featured.model}
                    </h2>
                    <p className="text-xs text-white/60">
                      {featured.variant} · {label(featured.fuelType)} · {formatKm(featured.odometerKm)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded border border-gold/30 bg-white/5 px-2 py-1 text-[11px] font-bold text-gold-pale">
                    {ordinalOwner(featured.ownership)}
                  </span>
                </div>
                <WhatsAppLink href={dealerWhatsApp(testDriveText)} vehicleId={featured.id} className="btn-wa w-full py-3">
                  Book Priority Test Drive
                </WhatsAppLink>
              </article>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
