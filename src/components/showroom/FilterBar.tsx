"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { BODY_TYPES, BUDGETS, FUEL_TYPES, SORTS, TRANSMISSIONS, label } from "@/lib/constants";

const QUICK_MAKES = ["Hyundai", "BMW", "Honda", "Swift", "Mahindra", "Toyota"];

type Pill = { key: string; label: string };

function PillGroup({ name, title, options, value, onChange }: {
  name: string; title: string; options: Pill[]; value: string; onChange: (k: string, v: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="field-label">{title}</legend>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {options.map((o) => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(name, active ? "" : o.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                active ? "border-gold bg-gold text-gold-ink" : "border-line bg-surface-low text-muted hover:border-gold"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FilterBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [syncedQ, setSyncedQ] = useState(urlQ);
  if (urlQ !== syncedQ) {
    // URL changed (quick-make chip, clear filters, back button) — mirror it in the box.
    setSyncedQ(urlQ);
    setQ(urlQ);
  }

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}#inventory`, { scroll: false }));
  }
  const set = (k: string, v: string) => update({ [k]: v });

  const active = ["q", "budget", "fuel", "transmission", "body"].some((k) => params.get(k));

  return (
    <div className="card p-4 shadow-lg md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft pb-3">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <SlidersHorizontal size={18} className="text-gold-deep" /> Find Your Perfect Verified Car
        </h2>
        <span className="flex items-center gap-2 text-xs font-semibold text-muted" aria-live="polite">
          {pending && <Loader2 size={14} className="animate-spin" />}
          {total} ready-to-deliver {total === 1 ? "car" : "cars"}
        </span>
      </div>

      <form
        role="search"
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          set("q", q.trim());
        }}
      >
        <label className="relative flex-1">
          <span className="sr-only">Search by make or model</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search make or model — Creta, BMW, City…"
            className="field pl-10"
          />
        </label>
        <button className="btn-dark px-5" type="submit">Search</button>
      </form>
      <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
        {QUICK_MAKES.map((m) => (
          <button key={m} type="button" onClick={() => set("q", m)} className="shrink-0 text-xs font-semibold text-gold-deep underline-offset-2 hover:underline">
            {m}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1.4fr_1fr_1.1fr]">
        <PillGroup name="budget" title="Budget" value={params.get("budget") ?? ""} onChange={set}
          options={BUDGETS.map((b) => ({ key: b.key, label: b.label }))} />
        <PillGroup name="fuel" title="Fuel" value={params.get("fuel") ?? ""} onChange={set}
          options={FUEL_TYPES.filter((f) => f !== "CNG").map((f) => ({ key: f, label: label(f) }))} />
        <PillGroup name="transmission" title="Transmission" value={params.get("transmission") ?? ""} onChange={set}
          options={TRANSMISSIONS.map((t) => ({ key: t, label: label(t) }))} />
        <PillGroup name="body" title="Body Type" value={params.get("body") ?? ""} onChange={set}
          options={BODY_TYPES.filter((b) => b !== "MUV").map((b) => ({ key: b, label: label(b) }))} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
        <label className="flex items-center gap-2 text-xs font-bold text-muted">
          SORT BY
          <select
            value={params.get("sort") ?? "featured"}
            onChange={(e) => set("sort", e.target.value === "featured" ? "" : e.target.value)}
            className="field w-auto py-1.5"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
        {active && (
          <button
            type="button"
            onClick={() => update({ q: "", budget: "", fuel: "", transmission: "", body: "" })}
            className="flex items-center gap-1 text-xs font-bold text-danger hover:underline"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
