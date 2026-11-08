"use client";

import { useActionState, useMemo } from "react";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { bookTestDrive, type FormState } from "@/app/actions/public";
import { WhatsAppIcon } from "@/components/ui/icons";

function isoDate(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function TestDriveForm({ vehicleId }: { vehicleId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(bookTestDrive, null);
  const errors = state && !state.ok ? state.errors ?? {} : {};
  const { min, max } = useMemo(() => {
    const now = new Date();
    return { min: isoDate(now), max: isoDate(new Date(now.getTime() + 30 * 86_400_000)) };
  }, []);

  if (state?.ok) {
    return (
      <div className="card flex flex-col gap-3 p-5">
        <CheckCircle2 className="text-whatsapp" size={30} />
        <p className="font-semibold">{state.message}</p>
        <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-wa">
          <WhatsAppIcon /> Confirm on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-3 p-5" noValidate>
      <h2 className="flex items-center gap-2 text-base font-bold"><CalendarCheck size={18} className="text-gold-deep" /> Book a Test Drive</h2>
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label>
        <span className="field-label">Name</span>
        <input name="name" autoComplete="name" className="field" aria-invalid={!!errors.name} />
        {errors.name && <span className="mt-1 block text-xs text-danger">{errors.name}</span>}
      </label>
      <label>
        <span className="field-label">Mobile / WhatsApp</span>
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98400 12345" className="field" aria-invalid={!!errors.phone} />
        {errors.phone && <span className="mt-1 block text-xs text-danger">{errors.phone}</span>}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="field-label">Date</span>
          <input name="date" type="date" min={min} max={max} defaultValue={min} className="field" aria-invalid={!!errors.date} />
        </label>
        <label>
          <span className="field-label">Slot</span>
          <select name="slot" className="field" defaultValue="Morning">
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>
        </label>
      </div>
      {state && !state.ok && state.message && <p className="text-sm text-danger">{state.message}</p>}
      <button disabled={pending} className="btn-gold py-3">
        {pending && <Loader2 size={18} className="animate-spin" />} Request Test Drive
      </button>
    </form>
  );
}
