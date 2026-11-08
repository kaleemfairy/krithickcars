"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { EMI_DEFAULTS, calcEmi, formatRupees } from "@/lib/format";

export function EmiCalculator({ price, tone = "light" }: { price: number; tone?: "light" | "dark" }) {
  const [down, setDown] = useState(Math.round((1 - EMI_DEFAULTS.ltv) * 100));
  const [months, setMonths] = useState<number>(EMI_DEFAULTS.months);
  const [rate, setRate] = useState<number>(EMI_DEFAULTS.annualRatePct);
  const ltv = 1 - down / 100;
  const emi = calcEmi(price, { ltv, months, annualRatePct: rate });
  const loan = price * ltv;
  const dark = tone === "dark";

  return (
    <div className={`rounded-xl border p-5 ${dark ? "border-white/10 bg-white/5 text-white" : "card"}`}>
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold"><Calculator size={18} className="text-gold-deep" /> EMI Calculator</h2>
      <div className="grid gap-4 text-sm">
        <label className="grid gap-1">
          <span className="flex justify-between font-semibold"><span>Down payment</span><span>{down}% · {formatRupees(price - loan)}</span></span>
          <input type="range" min={10} max={70} step={5} value={down} onChange={(e) => setDown(+e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="flex justify-between font-semibold"><span>Tenure</span><span>{months / 12} years</span></span>
          <input type="range" min={12} max={84} step={12} value={months} onChange={(e) => setMonths(+e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="flex justify-between font-semibold"><span>Interest rate</span><span>{rate.toFixed(1)}% p.a.</span></span>
          <input type="range" min={8} max={18} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} />
        </label>
      </div>
      <div className={`mt-4 flex items-end justify-between border-t pt-4 ${dark ? "border-white/10" : "border-line-soft"}`}>
        <span className={`text-xs ${dark ? "text-white/60" : "text-muted"}`}>Loan {formatRupees(loan)}</span>
        <span className="text-right">
          <span className="block font-display text-2xl font-bold text-gold-deep" aria-live="polite">{formatRupees(emi)}</span>
          <span className={`text-xs ${dark ? "text-white/60" : "text-muted"}`}>per month</span>
        </span>
      </div>
    </div>
  );
}
