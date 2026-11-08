"use client";

import { useOptimistic, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setVehicleStatus } from "@/app/actions/admin";
import { VEHICLE_STATUSES, label } from "@/lib/constants";

export const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-surface-high text-muted border-line",
  LIVE: "bg-whatsapp/12 text-whatsapp-dark border-whatsapp/40",
  UNDER_INSPECTION: "bg-amber-100 text-amber-800 border-amber-300",
  BOOKED: "bg-sky-100 text-sky-800 border-sky-300",
  SOLD: "bg-onyx text-gold-pale border-onyx",
};

export function StatusSelect({ id, status, canGoLive }: { id: string; status: string; canGoLive: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(status);

  return (
    <span className="relative inline-flex items-center">
      <select
        aria-label="Vehicle status"
        value={optimistic}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          start(async () => {
            setOptimistic(next);
            await setVehicleStatus(id, next);
          });
        }}
        className={`cursor-pointer appearance-none rounded-full border py-1 pl-3 pr-7 text-xs font-bold outline-none focus:ring-2 focus:ring-gold/40 ${STATUS_STYLES[optimistic]}`}
      >
        {VEHICLE_STATUSES.map((s) => (
          <option key={s} value={s} disabled={s === "LIVE" && !canGoLive && optimistic !== "LIVE"}>
            {label(s)}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[10px]">
        {pending ? <Loader2 size={12} className="animate-spin" /> : "▾"}
      </span>
    </span>
  );
}
