import Link from "next/link";
import { BadgeCheck, CarFront, Clock, FileCheck2, MapPin, Phone, ShieldCheck, Wrench } from "lucide-react";
import { DEALER } from "@/lib/constants";
import { dealerWhatsApp } from "@/lib/whatsapp";
import { EMI_DEFAULTS } from "@/lib/format";
import img from "@/data/design-images.json";
import { CarImage } from "./CarImage";
import { SellCarForm } from "./SellCarForm";
import { WhatsAppLink } from "./WhatsAppLink";

function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <p className="eyebrow mb-1 text-gold-deep">{eyebrow}</p>
        <h2 className="font-display text-3xl font-semibold md:text-4xl">{title}</h2>
      </div>
      {children && <p className="max-w-md text-sm text-muted">{children}</p>}
    </div>
  );
}
export { SectionHead };

export function TrustSection() {
  const items = [
    {
      icon: Wrench,
      title: "160-Point Certified Inspection",
      body: "Engine compression, gearbox, suspension, brakes, electricals, tyres and underbody — every car is graded by our technicians before it reaches the showroom. Ask for the inspection PDF on any car.",
      points: ["Engine & compression graded /10", "Tyre life & brake wear measured", "OBD scan & electrical check"],
      wide: true,
    },
    {
      icon: ShieldCheck,
      title: "100% Non-Accidental Guarantee",
      body: "Paint-depth gauged and structurally verified. No flood, no chassis repair — or your money back.",
    },
    {
      icon: FileCheck2,
      title: "Seamless RC Transfer",
      body: "We handle Form 29/30, NOC, insurance transfer and RTO paperwork across Tamil Nadu.",
    },
    {
      icon: BadgeCheck,
      title: "Lowest Price Promise",
      body: "Transparent on-road price with no hidden charges. Found it cheaper? Show us — we'll match it.",
    },
  ];
  return (
    <section id="kc-certified" className="scroll-mt-20 border-y border-line-soft bg-surface-low py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead eyebrow="KC Certified" title="Why Buy From Krithick Cars?">
          Peace of mind is part of the price. Every certified car carries our seal and documentation.
        </SectionHead>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, ...it }) => (
            <article key={it.title} className={`card p-6 ${it.wide ? "md:col-span-2 md:row-span-2 bg-onyx text-white" : ""}`}>
              <span className={`mb-4 inline-flex size-11 items-center justify-center rounded-full ${it.wide ? "bg-gold text-gold-ink" : "bg-gold/15 text-gold-deep"}`}>
                <Icon size={22} />
              </span>
              <h3 className={`font-bold ${it.wide ? "font-display text-2xl" : "text-lg"}`}>{it.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${it.wide ? "text-white/70" : "text-muted"}`}>{it.body}</p>
              {it.points && (
                <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                  {it.points.map((p) => (
                    <li key={p} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs font-semibold text-gold-pale">{p}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SellCarSection() {
  return (
    <section id="sell-car" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 md:px-8">
      <div className="grid items-center gap-10 overflow-hidden rounded-2xl bg-onyx p-6 text-white md:p-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-2 text-gold">Sell / Exchange</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Want to Sell or Upgrade Your Car?</h2>
          <p className="mt-3 max-w-lg text-white/70">
            Share a few details and get an instant, fair valuation on WhatsApp within 30 minutes. Free doorstep
            inspection in Chennai, same-day payment and full RC transfer handled by us.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
            {["Best exchange bonus on any KC car", "Instant bank transfer", "Loan closure assistance", "Free doorstep inspection"].map((t) => (
              <li key={t} className="flex items-center gap-2"><BadgeCheck size={16} className="text-gold" />{t}</li>
            ))}
          </ul>
        </div>
        <SellCarForm />
      </div>
    </section>
  );
}

export function DeliveriesSection() {
  const d = [
    { src: img.deliv1, name: "The Raghavan family", car: "Hyundai Creta · Anna Nagar", quote: "Transparent from test drive to RC transfer. The inspection report gave us total confidence." },
    { src: img.deliv2, name: "Karthik S.", car: "BMW 3 Series · OMR", quote: "Luxury car at a genuinely fair price. Paperwork was done in three days." },
    { src: img.deliv3, name: "Priya & Arvind", car: "Maruti Swift · Tambaram", quote: "Our first car! They exchanged our old bike and arranged the loan too." },
  ];
  return (
    <section id="about" className="scroll-mt-20 border-t border-line-soft bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead eyebrow="Happy Owners" title="Recent Showroom Deliveries">
          Krithick Cars is a family-run pre-owned dealership on GST Road, trusted by thousands of Chennai families.
        </SectionHead>
        <div className="grid gap-5 md:grid-cols-3">
          {d.map((x) => (
            <figure key={x.name} className="card overflow-hidden">
              <CarImage src={x.src} alt={`${x.name} taking delivery`} className="h-52 w-full" />
              <figcaption className="p-5">
                <blockquote className="text-sm leading-relaxed text-ink">“{x.quote}”</blockquote>
                <p className="mt-3 text-sm font-bold">{x.name}</p>
                <p className="text-xs text-subtle">{x.car}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 md:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-1 text-gold-deep">Showroom</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Visit Krithick Cars</h2>
          <dl className="mt-6 grid gap-5">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 shrink-0 text-gold-deep" />
              <div><dt className="font-bold">Address</dt><dd className="text-sm text-muted">{DEALER.address}</dd></div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 shrink-0 text-gold-deep" />
              <div><dt className="font-bold">Working hours</dt><dd className="text-sm text-muted">{DEALER.hours}</dd></div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 shrink-0 text-gold-deep" />
              <div>
                <dt className="font-bold">Sales &amp; emergency contact</dt>
                <dd className="text-sm text-muted"><a className="hover:text-gold-deep" href={`tel:${DEALER.phoneE164}`}>{DEALER.phoneDisplay}</a> · available on WhatsApp 24×7</dd>
              </div>
            </div>
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={DEALER.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-dark"><MapPin size={18} /> Open in Google Maps</a>
            <WhatsAppLink href={dealerWhatsApp("Hi Krithick Cars, I'd like to visit the showroom. Please share the location.")}>Get Directions on WhatsApp</WhatsAppLink>
          </div>
        </div>
        <a href={DEALER.mapUrl} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-2xl">
          <CarImage src={img.showroom} alt="Krithick Cars showroom on GST Road" className="h-72 w-full transition duration-500 group-hover:scale-105 lg:h-full" />
          <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-onyx/85 px-3 py-2 text-sm font-bold text-white backdrop-blur">
            <CarFront size={18} className="text-gold" /> GST Road, Chennai · Tap for map
          </span>
        </a>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-onyx pb-24 pt-12 text-white/70 md:pb-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-bold text-white">Krithick <span className="text-gold">Cars</span></p>
          <p className="mt-2 max-w-sm text-sm">{DEALER.tagline}. 160-point inspected, non-accidental pre-owned cars with RC transfer assistance.</p>
        </div>
        <div>
          <p className="eyebrow mb-3 text-gold">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#inventory" className="hover:text-white">Inventory</Link></li>
            <li><Link href="/#kc-certified" className="hover:text-white">KC Certified</Link></li>
            <li><Link href="/#sell-car" className="hover:text-white">Sell / Exchange</Link></li>
            <li><Link href="/admin" className="hover:text-white">Staff Portal</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3 text-gold">Contact</p>
          <ul className="space-y-2 text-sm">
            <li><a href={`tel:${DEALER.phoneE164}`} className="hover:text-white">{DEALER.phoneDisplay}</a></li>
            <li>{DEALER.hours}</li>
            <li>{DEALER.address}</li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl px-4 text-xs text-white/40 md:px-8">
        © {new Date().getFullYear()} Krithick Cars. *EMI is indicative: {EMI_DEFAULTS.ltv * 100}% loan, {EMI_DEFAULTS.months / 12} years, {EMI_DEFAULTS.annualRatePct}% p.a. Subject to lender approval.
      </p>
    </footer>
  );
}

export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line-soft bg-surface/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <a href={`tel:${DEALER.phoneE164}`} className="btn-dark whitespace-nowrap py-3"><Phone size={18} /> Call Now</a>
      <WhatsAppLink href={dealerWhatsApp("Hello Krithick Cars Concierge, I would like to know about your current stock.")} className="btn-wa whitespace-nowrap px-2 py-3">
        WhatsApp Concierge
      </WhatsAppLink>
    </div>
  );
}
