"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  BadgeCheck, Camera, CheckCircle2, ClipboardCheck, Copy, Fingerprint, Gauge, IndianRupee, Loader2, Rocket, Save, ShieldCheck,
} from "lucide-react";
import { saveVehicle } from "@/app/actions/admin";
import {
  BODY_TYPES, FUEL_TYPES, MAKES, PHOTO_ANGLES, TN_RTO_OFFICES, TRANSMISSIONS, label,
} from "@/lib/constants";
import { calcEmi, formatLakhs, formatRupees, normalizeRegNumber, rtoCode } from "@/lib/format";
import { EMPTY_INSPECTION, type Inspection, type VehicleImage } from "@/lib/vehicle";
import { draftVehicleSchema, publishVehicleSchema } from "@/lib/vehicle-schema";
import { buildEnquiryMessage, dealerWhatsApp } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";
import { PhotoSlots } from "./PhotoSlots";

export type VehicleFormValues = {
  make: string; model: string; variant: string; year: number | ""; regNumber: string; rtoOffice: string;
  ownership: number; odometerKm: number | ""; fuelType: string; transmission: string; bodyType: string;
  exteriorColor: string; interior: string; insurance: string; insuranceExpiry: string; serviceHistory: string;
  highlights: string; askingPrice: number | ""; floorPrice: number | ""; isCertified: boolean; isFeatured: boolean;
  images: VehicleImage[]; inspection: Inspection;
};

export const EMPTY_VEHICLE: VehicleFormValues = {
  make: "", model: "", variant: "", year: "", regNumber: "", rtoOffice: "", ownership: 1, odometerKm: "",
  fuelType: "PETROL", transmission: "MANUAL", bodyType: "SUV", exteriorColor: "", interior: "", insurance: "Comprehensive",
  insuranceExpiry: "", serviceHistory: "", highlights: "", askingPrice: "", floorPrice: "", isCertified: false,
  isFeatured: false, images: [], inspection: EMPTY_INSPECTION,
};

const SECTIONS = [
  { id: "identity", label: "Identity", icon: Fingerprint },
  { id: "mechanical", label: "Mechanical", icon: Gauge },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "pricing", label: "Pricing", icon: IndianRupee },
  { id: "inspection", label: "Inspection", icon: ClipboardCheck },
  { id: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon },
] as const;

const inr = new Intl.NumberFormat("en-IN");
const YEARS = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

/* ---------------------------------------------------------------- bits */

function Section({ id, n, title, icon: Icon, done, children }: {
  id: string; n: number; title: string; icon: React.ElementType; done: boolean; children: React.ReactNode;
}) {
  return (
    <section id={id} className="card scroll-mt-24 p-5 md:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-bold">
        <span className={`inline-flex size-8 items-center justify-center rounded-full text-sm ${done ? "bg-whatsapp text-white" : "bg-onyx text-gold"}`}>
          {done ? <CheckCircle2 size={16} /> : n}
        </span>
        <Icon size={18} className="text-gold-deep" /> {title}
      </h2>
      {children}
    </section>
  );
}

function F({ label: l, error, hint, required, children, className = "" }: {
  label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{l}{required && <span className="text-danger"> *</span>}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-subtle">{hint}</span> : null}
    </label>
  );
}

function Segmented({ value, options, onChange, name }: { value: string; options: readonly string[]; onChange: (v: string) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)}
          className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${value === o ? "border-gold bg-gold text-gold-ink" : "border-line bg-surface-low text-muted hover:border-gold"}`}>
          {label(o)}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, title, desc, tone = "gold" }: { checked: boolean; onChange: (v: boolean) => void; title: string; desc: string; tone?: "gold" | "wa" }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${checked ? (tone === "wa" ? "border-whatsapp bg-whatsapp/8" : "border-gold bg-gold/10") : "border-line bg-surface-low"}`}>
      <span className={`mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${checked ? (tone === "wa" ? "bg-whatsapp" : "bg-gold") : "bg-surface-high"}`}>
        <span className={`size-4 rounded-full bg-white shadow transition ${checked ? "translate-x-4" : ""}`} />
      </span>
      <span><span className="block text-sm font-bold">{title}</span><span className="block text-xs text-muted">{desc}</span></span>
    </button>
  );
}

function MoneyInput({ value, onChange, invalid, id }: { value: number | ""; onChange: (v: number | "") => void; invalid?: boolean; id?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-subtle">₹</span>
      <input id={id} inputMode="numeric" className="field pl-7 font-bold" aria-invalid={invalid}
        value={value === "" ? "" : inr.format(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(digits ? Number(digits) : "");
        }} />
      {value !== "" && value >= 100_000 && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gold-deep">{formatLakhs(value)}</span>}
    </div>
  );
}

function Slider({ label: l, value, onChange, max, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; max: number; step?: number; suffix: string }) {
  const pct = value / max;
  const tone = pct >= 0.8 ? "text-whatsapp-dark" : pct >= 0.6 ? "text-amber-700" : "text-danger";
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-xs font-bold"><span className="uppercase tracking-wider text-muted">{l}</span><span className={tone}>{value}{suffix}</span></span>
      <input type="range" min={0} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}

/* ---------------------------------------------------------------- form */

export function VehicleForm({ initial, id, currentStatus }: { initial: VehicleFormValues; id?: string; currentStatus?: string }) {
  const router = useRouter();
  const [v, setV] = useState<VehicleFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [intent, setIntent] = useState<"draft" | "publish">("draft");
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof VehicleFormValues>(k: K, val: VehicleFormValues[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    setErrors((e) => {
      if (!e[k as string]) return e;
      const n = { ...e };
      delete n[k as string];
      return n;
    });
  };
  const setInsp = <K extends keyof Inspection>(k: K, val: Inspection[K]) =>
    setV((p) => ({ ...p, inspection: { ...p.inspection, [k]: val } }));

  const emi = v.askingPrice ? calcEmi(v.askingPrice) : 0;
  const margin = v.askingPrice && v.floorPrice ? v.askingPrice - v.floorPrice : null;
  const anglesDone = PHOTO_ANGLES.filter((a) => v.images.some((i) => i.angle === a.key)).length;

  const waMessage = useMemo(
    () =>
      buildEnquiryMessage({
        year: Number(v.year) || new Date().getFullYear(),
        make: v.make || "[Make]",
        model: v.model || "[Model]",
        variant: v.variant,
        regNumber: v.regNumber || "[Reg Number]",
        askingPrice: Number(v.askingPrice) || 0,
      }),
    [v.year, v.make, v.model, v.variant, v.regNumber, v.askingPrice],
  );

  const done = {
    identity: !!(v.make && v.model && v.year && v.regNumber && v.rtoOffice),
    mechanical: v.odometerKm !== "" && !!v.exteriorColor,
    photos: anglesDone === PHOTO_ANGLES.length,
    pricing: !!(v.askingPrice && v.floorPrice && v.floorPrice <= v.askingPrice),
    inspection: v.inspection.nonAccidental && !!v.inspection.inspectedBy,
    whatsapp: !!(v.make && v.model && v.regNumber && v.askingPrice),
  };

  function submit(which: "draft" | "publish") {
    setIntent(which);
    setBanner(null);
    const payload = { ...v, insuranceExpiry: v.insuranceExpiry || undefined };
    const schema = which === "publish" ? publishVehicleSchema : draftVehicleSchema;
    const check = schema.safeParse(payload);
    if (!check.success) {
      const errs: Record<string, string> = {};
      for (const i of check.error.issues) errs[i.path.join(".")] ??= i.message;
      setErrors(errs);
      setBanner({ tone: "err", text: `${Object.keys(errs).length} field(s) need attention before you can ${which === "publish" ? "publish" : "save"}.` });
      const first = Object.keys(errs)[0]?.split(".")[0];
      const sectionOf: Record<string, string> = { images: "photos", inspection: "inspection", askingPrice: "pricing", floorPrice: "pricing", odometerKm: "mechanical", exteriorColor: "mechanical" };
      document.getElementById(sectionOf[first] ?? "identity")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    start(async () => {
      const res = await saveVehicle(payload, which, id);
      if (!res.ok) {
        setErrors(res.errors);
        setBanner({ tone: "err", text: res.message });
        return;
      }
      setErrors({});
      if (!id) {
        router.replace(`/admin/inventory/${res.id}?saved=${which}`);
      } else {
        setBanner({ tone: "ok", text: which === "publish" ? "Published live to the showroom." : "Draft saved." });
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
      {/* Section stepper */}
      <nav aria-label="Form sections" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:self-start lg:px-0">
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} className="flex shrink-0 items-center gap-2 rounded-lg border border-line-soft bg-surface px-3 py-2 text-xs font-bold text-muted hover:border-gold">
            <span className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] ${done[s.id] ? "bg-whatsapp text-white" : "bg-surface-high"}`}>
              {done[s.id] ? "✓" : i + 1}
            </span>
            {s.label}
          </a>
        ))}
      </nav>

      <div className="min-w-0 space-y-6">
        {banner && (
          <p role="status" className={`rounded-xl px-4 py-3 text-sm font-bold ${banner.tone === "ok" ? "bg-whatsapp/12 text-whatsapp-dark" : "bg-danger/10 text-danger"}`}>
            {banner.text}
          </p>
        )}

        {/* 1. Identity */}
        <Section id="identity" n={1} title="Vehicle Identity" icon={Fingerprint} done={done.identity}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <F label="Brand / Make" required error={errors.make}>
              <select className="field" value={v.make} aria-invalid={!!errors.make} onChange={(e) => set("make", e.target.value)}>
                <option value="">Select brand…</option>
                {MAKES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </F>
            <F label="Model" required error={errors.model}>
              <input className="field" value={v.model} aria-invalid={!!errors.model} placeholder="Creta" onChange={(e) => set("model", e.target.value)} />
            </F>
            <F label="Variant / Trim" error={errors.variant}>
              <input className="field" value={v.variant} placeholder="SX (O) 1.4 Turbo DCT" onChange={(e) => set("variant", e.target.value)} />
            </F>
            <F label="Registration year" required error={errors.year}>
              <select className="field" value={v.year} aria-invalid={!!errors.year} onChange={(e) => set("year", e.target.value ? Number(e.target.value) : "")}>
                <option value="">Year…</option>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </F>
            <F label="Registration plate" required error={errors.regNumber} hint="e.g. TN 09 CE 9900 — auto-formatted">
              <input
                className="field font-bold uppercase tracking-wider"
                value={v.regNumber}
                aria-invalid={!!errors.regNumber}
                placeholder="TN 09 CE 9900"
                autoCapitalize="characters"
                maxLength={16}
                onChange={(e) => set("regNumber", e.target.value.toUpperCase())}
                onBlur={(e) => {
                  const reg = normalizeRegNumber(e.target.value);
                  set("regNumber", reg);
                  const code = rtoCode(reg);
                  const match = TN_RTO_OFFICES.find((o) => o.startsWith(code));
                  if (match && !v.rtoOffice) set("rtoOffice", match);
                }}
              />
            </F>
            <F label="RTO office" error={errors.rtoOffice}>
              <select className="field" value={v.rtoOffice} aria-invalid={!!errors.rtoOffice} onChange={(e) => set("rtoOffice", e.target.value)}>
                <option value="">Select RTO…</option>
                {TN_RTO_OFFICES.map((o) => <option key={o}>{o}</option>)}
                {v.rtoOffice && !(TN_RTO_OFFICES as readonly string[]).includes(v.rtoOffice) && <option>{v.rtoOffice}</option>}
              </select>
            </F>
            <F label="Ownership" required>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} type="button" aria-pressed={v.ownership === n} onClick={() => set("ownership", n)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold ${v.ownership === n ? "border-gold bg-gold text-gold-ink" : "border-line bg-surface-low text-muted"}`}>
                    {n === 4 ? "4th+" : `${n}${n === 1 ? "st" : n === 2 ? "nd" : "rd"}`}
                  </button>
                ))}
              </div>
            </F>
            <F label="Body type" required className="sm:col-span-2">
              <Segmented name="Body type" value={v.bodyType} options={BODY_TYPES} onChange={(x) => set("bodyType", x)} />
            </F>
          </div>
        </Section>

        {/* 2. Mechanical */}
        <Section id="mechanical" n={2} title="Mechanical & Specifications" icon={Gauge} done={done.mechanical}>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Odometer (KM)" required error={errors.odometerKm}>
              <div className="relative">
                <input inputMode="numeric" className="field pr-12 font-bold" aria-invalid={!!errors.odometerKm}
                  value={v.odometerKm === "" ? "" : inr.format(v.odometerKm)} placeholder="28,400"
                  onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 6); set("odometerKm", d ? Number(d) : ""); }} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-subtle">KM</span>
              </div>
            </F>
            <F label="Exterior colour" error={errors.exteriorColor}>
              <input className="field" value={v.exteriorColor} aria-invalid={!!errors.exteriorColor} placeholder="Polar White" onChange={(e) => set("exteriorColor", e.target.value)} />
            </F>
            <F label="Fuel type" required><Segmented name="Fuel type" value={v.fuelType} options={FUEL_TYPES} onChange={(x) => set("fuelType", x)} /></F>
            <F label="Transmission" required><Segmented name="Transmission" value={v.transmission} options={TRANSMISSIONS} onChange={(x) => set("transmission", x)} /></F>
            <F label="Interior package" className="sm:col-span-2">
              <input className="field" value={v.interior} placeholder="Black & beige leatherette · ventilated seats · sunroof" onChange={(e) => set("interior", e.target.value)} />
            </F>
            <F label="Insurance status">
              <select className="field" value={v.insurance} onChange={(e) => set("insurance", e.target.value)}>
                {["Comprehensive", "Comprehensive + Zero Dep", "Zero Dep", "Third party", "Expired"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </F>
            <F label="Insurance expiry" error={errors.insuranceExpiry}>
              <input type="date" className="field" value={v.insuranceExpiry} onChange={(e) => set("insuranceExpiry", e.target.value)} />
            </F>
            <F label="Dealership service history" className="sm:col-span-2">
              <textarea rows={2} className="field" value={v.serviceHistory} placeholder="All services at authorised dealer…" onChange={(e) => set("serviceHistory", e.target.value)} />
            </F>
            <F label="Card highlights" hint="Separate with • — shown on the showroom card" className="sm:col-span-2">
              <input className="field" value={v.highlights} placeholder="Panoramic Sunroof • Ventilated Seats • Bose Audio" onChange={(e) => set("highlights", e.target.value)} />
            </F>
          </div>
        </Section>

        {/* 3. Photos */}
        <Section id="photos" n={3} title="Multi-Angle Photo Stage" icon={Camera} done={done.photos}>
          <PhotoSlots
            images={v.images}
            onChange={(fn) => {
              setV((p) => ({ ...p, images: fn(p.images) }));
              setErrors(({ images: _drop, ...rest }) => rest); // eslint-disable-line @typescript-eslint/no-unused-vars
            }}
            error={errors.images}
          />
        </Section>

        {/* 4. Pricing */}
        <Section id="pricing" n={4} title="Pricing & Margins" icon={IndianRupee} done={done.pricing}>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Public asking price" required error={errors.askingPrice}>
              <MoneyInput value={v.askingPrice} invalid={!!errors.askingPrice} onChange={(x) => set("askingPrice", x)} />
            </F>
            <F label="Minimum floor price · staff only" required error={errors.floorPrice} hint={margin !== null ? `Negotiation room: ${formatRupees(margin)}` : "Never shown to customers"}>
              <MoneyInput value={v.floorPrice} invalid={!!errors.floorPrice} onChange={(x) => set("floorPrice", x)} />
            </F>
            <div className="rounded-xl bg-onyx p-4 text-white sm:col-span-2">
              <p className="eyebrow text-white/50">EMI preview · 80% loan · 5 yrs · 11.5% p.a.</p>
              <p className="mt-1 font-display text-3xl font-bold text-gold">{emi ? `${formatRupees(emi)}/mo` : "—"}</p>
              <p className="text-xs text-white/60">Displayed on the showroom card as “EMI from”.</p>
            </div>
            <Toggle checked={v.isCertified} onChange={(x) => set("isCertified", x)} title="Award KC Certified 160-Point badge"
              desc="Requires the non-accidental sign-off in the inspection section." />
            <Toggle checked={v.isFeatured} onChange={(x) => set("isFeatured", x)} title="Spotlight deal of the week"
              desc="Shows this car in the homepage hero (replaces the current one)." />
          </div>
        </Section>

        {/* 5. Inspection */}
        <Section id="inspection" n={5} title="160-Point Inspection Checklist" icon={ClipboardCheck} done={done.inspection}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Engine & compression" value={v.inspection.engineGrade} max={10} step={0.5} suffix="/10" onChange={(x) => setInsp("engineGrade", x)} />
            <Slider label="Transmission & clutch" value={v.inspection.transmissionGrade} max={10} step={0.5} suffix="/10" onChange={(x) => setInsp("transmissionGrade", x)} />
            <Slider label="Suspension" value={v.inspection.suspensionPct} max={100} suffix="%" onChange={(x) => setInsp("suspensionPct", x)} />
            <Slider label="Tyre life" value={v.inspection.tyreLifePct} max={100} suffix="%" onChange={(x) => setInsp("tyreLifePct", x)} />
            <Slider label="Brake pads & discs" value={v.inspection.brakePct} max={100} suffix="%" onChange={(x) => setInsp("brakePct", x)} />
            <F label="Inspected by">
              <input className="field" value={v.inspection.inspectedBy} placeholder="Technician name" onChange={(e) => setInsp("inspectedBy", e.target.value)} />
            </F>
            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
              <Toggle tone="wa" checked={v.inspection.nonAccidental} onChange={(x) => setInsp("nonAccidental", x)}
                title="Non-accidental guarantee sign-off" desc="Paint-depth & structural check passed. No chassis repair." />
              <Toggle tone="wa" checked={v.inspection.floodFree} onChange={(x) => setInsp("floodFree", x)}
                title="Flood-free verified" desc="No water ingress, rust or electrical corrosion." />
            </div>
            {errors["inspection.nonAccidental"] && <p className="text-sm font-semibold text-danger sm:col-span-2">{errors["inspection.nonAccidental"]}</p>}
            <F label="Inspection notes (internal)" className="sm:col-span-2">
              <textarea rows={2} className="field" value={v.inspection.notes} onChange={(e) => setInsp("notes", e.target.value)} />
            </F>
          </div>
        </Section>

        {/* 6. WhatsApp preview */}
        <Section id="whatsapp" n={6} title="WhatsApp Auto-Dispatcher Preview" icon={WhatsAppIcon} done={done.whatsapp}>
          <p className="mb-4 text-sm text-muted">This is the exact message a buyer sends when they tap <b>Enquire WhatsApp</b> on this car.</p>
          <div className="rounded-xl bg-[#e5ddd5] p-4" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
            <div className="ml-auto max-w-md rounded-xl rounded-tr-sm bg-[#dcf8c6] px-3.5 py-2.5 text-sm leading-relaxed text-[#111] shadow-sm">
              {waMessage}
              <span className="mt-1 block text-right text-[10px] text-black/45">now ✓✓</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-outline text-xs" onClick={async () => {
              await navigator.clipboard.writeText(dealerWhatsApp(waMessage));
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}>
              <Copy size={14} /> {copied ? "Link copied" : "Copy wa.me link"}
            </button>
            <a href={dealerWhatsApp(waMessage)} target="_blank" rel="noopener noreferrer" className="btn-wa text-xs"><WhatsAppIcon width={14} height={14} /> Test link</a>
          </div>
        </Section>

        {/* Action dock */}
        <div className="sticky bottom-20 z-20 lg:bottom-4">
          <div className="card flex flex-wrap items-center justify-between gap-3 border-gold/40 p-3 shadow-xl">
            <span className="flex items-center gap-2 px-1 text-xs font-semibold text-muted">
              {v.isCertified ? <BadgeCheck size={16} className="text-gold-deep" /> : <ShieldCheck size={16} />}
              {currentStatus ? <>Status: <b className="text-ink">{label(currentStatus)}</b></> : "New listing"} · {anglesDone}/6 photos
            </span>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <button type="button" disabled={pending} onClick={() => submit("draft")} className="btn-outline flex-1 sm:flex-none">
                {pending && intent === "draft" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save as Draft
              </button>
              <button type="button" disabled={pending} onClick={() => submit("publish")} className="btn-wa flex-1 sm:flex-none">
                {pending && intent === "publish" ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                {currentStatus === "LIVE" ? "Update Live Listing" : "Publish Live"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
