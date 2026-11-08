"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Phone } from "lucide-react";
import { updateLead } from "@/app/actions/admin";
import { LEAD_STATUSES, label } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";

const TONE: Record<string, string> = {
  NEW: "bg-whatsapp/12 text-whatsapp-dark border-whatsapp/40",
  CONTACTED: "bg-sky-100 text-sky-800 border-sky-300",
  TEST_DRIVE_SCHEDULED: "bg-amber-100 text-amber-800 border-amber-300",
  WON: "bg-onyx text-gold-pale border-onyx",
  LOST: "bg-surface-high text-subtle border-line",
};

export type LeadView = {
  id: string; customerName: string; customerPhone: string; channel: string; kind: string; status: string;
  message: string; createdAt: string; vehicle: { title: string; regNumber: string } | null;
};

function safeWa(phone: string, text: string) {
  try {
    return buildWhatsAppUrl(phone, null, text);
  } catch {
    return null;
  }
}

export function LeadRow({ lead }: { lead: LeadView }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(lead.status);
  const [editing, setEditing] = useState(!lead.customerPhone);
  const [name, setName] = useState(lead.customerName);
  const [phone, setPhone] = useState(lead.customerPhone);

  const wa = phone ? safeWa(phone, `Hello ${name}, this is Krithick Cars regarding your enquiry${lead.vehicle ? ` for the ${lead.vehicle.title}` : ""}.`) : null;
  const when = new Date(lead.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <li className="card grid gap-3 p-4 md:grid-cols-[1.2fr_1.4fr_auto] md:items-center">
      <div className="min-w-0">
        {editing ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                await updateLead(lead.id, { customerName: name || "Customer", customerPhone: phone });
                setEditing(false);
              });
            }}
          >
            <input aria-label="Customer name" className="field w-36 py-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            <input aria-label="Customer phone" className="field w-36 py-1.5" value={phone} placeholder="Phone from WhatsApp" onChange={(e) => setPhone(e.target.value)} />
            <button className="btn-dark px-2.5 py-1.5" aria-label="Save contact">{pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
          </form>
        ) : (
          <p className="flex items-center gap-2 font-bold">
            {name}
            <button type="button" onClick={() => setEditing(true)} className="text-subtle hover:text-ink" aria-label="Edit contact"><Pencil size={13} /></button>
          </p>
        )}
        {!editing && <p className="text-xs text-muted">{phone || "No number yet"}</p>}
        <p className="mt-1 text-[11px] text-subtle">{when} · {label(lead.channel)} · {label(lead.kind)}</p>
      </div>
      <div className="min-w-0 text-sm">
        {lead.vehicle ? <p className="truncate font-semibold">{lead.vehicle.title} <span className="text-xs text-muted">({lead.vehicle.regNumber})</span></p> : <p className="font-semibold">General / Sell car</p>}
        {lead.message && <p className="truncate text-xs text-muted">{lead.message}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {phone && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="rounded-lg border border-line p-2 text-ink hover:bg-surface-mid" aria-label="Call"><Phone size={16} /></a>}
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-whatsapp p-2 text-white" aria-label="WhatsApp"><WhatsAppIcon width={16} height={16} /></a>}
        <select
          aria-label="Lead status"
          value={status}
          disabled={pending}
          onChange={(e) => {
            const s = e.target.value;
            setStatus(s);
            start(() => updateLead(lead.id, { status: s as (typeof LEAD_STATUSES)[number] }));
          }}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none ${TONE[status]}`}
        >
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </div>
    </li>
  );
}
