"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { requestValuation, type FormState } from "@/app/actions/public";
import { WhatsAppIcon } from "@/components/ui/icons";

function Field({ name, label, error, ...rest }: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-white/60">{label}</span>
      <input
        name={name}
        aria-invalid={!!error}
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold focus:ring-2 focus:ring-gold/30 aria-[invalid=true]:border-red-400"
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

export function SellCarForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestValuation, null);
  const errors = state && !state.ok ? state.errors ?? {} : {};

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-gold/30 bg-white/5 p-6">
        <CheckCircle2 className="text-whatsapp" size={36} />
        <p className="text-base font-semibold text-white">{state.message}</p>
        <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-wa">
          <WhatsAppIcon /> Send details on WhatsApp now
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-gold/25 bg-white/5 p-5 sm:grid-cols-2" noValidate>
      <h3 className="text-lg font-bold text-gold-pale sm:col-span-2">Quick Valuation Request</h3>
      <div className="sm:col-span-2">
        <Field name="carModel" label="Car brand & model" placeholder="e.g. Hyundai i20 Asta" error={errors.carModel} required />
      </div>
      <Field name="year" label="Year" inputMode="numeric" placeholder="2019" maxLength={4} error={errors.year} required />
      <Field name="regNumber" label="Reg. number" placeholder="TN 09 AB 1234" autoCapitalize="characters" error={errors.regNumber} required />
      <Field name="name" label="Your name" autoComplete="name" error={errors.name} required />
      <Field name="phone" label="Mobile / WhatsApp" type="tel" inputMode="tel" autoComplete="tel" placeholder="98400 12345" error={errors.phone} required />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state && !state.ok && state.message && <p className="text-sm text-red-300 sm:col-span-2">{state.message}</p>}
      <button disabled={pending} className="btn-gold mt-1 py-3 sm:col-span-2">
        {pending ? <Loader2 size={18} className="animate-spin" /> : <WhatsAppIcon />}
        Get Valuation in 30 Minutes
      </button>
    </form>
  );
}
