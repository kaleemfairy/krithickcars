"use client";

import { WhatsAppIcon } from "@/components/ui/icons";

type Props = {
  href: string;
  vehicleId?: string;
  className?: string;
  children: React.ReactNode;
  iconSize?: number;
};

/**
 * Opens WhatsApp with the pre-filled message and records an anonymous
 * enquiry (once per vehicle per browser session) so staff see it in Leads.
 */
export function WhatsAppLink({ href, vehicleId, className = "btn-wa", children, iconSize = 18 }: Props) {
  function track() {
    if (!vehicleId) return;
    try {
      const key = `kc_enq_${vehicleId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — still track */
    }
    const body = JSON.stringify({ vehicleId });
    if (!navigator.sendBeacon?.("/api/enquiries", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/enquiries", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
    }
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={track} className={className}>
      <WhatsAppIcon width={iconSize} height={iconSize} />
      {children}
    </a>
  );
}
