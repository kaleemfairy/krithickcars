"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, MapPin, Menu, Phone, X } from "lucide-react";
import { DEALER } from "@/lib/constants";
import { dealerWhatsApp } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";

const NAV = [
  { href: "/#inventory", label: "Inventory" },
  { href: "/#kc-certified", label: "KC Certified" },
  { href: "/#sell-car", label: "Sell / Exchange" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const concierge = dealerWhatsApp("Hello Krithick Cars Concierge, I would like to know about your current stock.");

  return (
    <>
      {/* Utility bar */}
      <div className="bg-graphite text-[11px] font-semibold tracking-wide text-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 md:px-8">
          <span className="flex items-center gap-1.5 text-gold-pale">
            <BadgeCheck size={14} /> Verified Pre-Owned Cars @ Lowest Price
          </span>
          <span className="hidden items-center gap-1.5 md:flex">
            <MapPin size={14} /> Chennai &amp; Tamil Nadu delivery available
          </span>
          <a href={`tel:${DEALER.phoneE164}`} className="hidden items-center gap-1.5 hover:text-gold-pale sm:flex">
            <Phone size={13} /> {DEALER.phoneDisplay}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line-soft bg-surface/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-20 md:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Krithick Cars home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt=""
              className="size-11 rounded-full border border-gold bg-onyx object-contain p-0.5 shadow-sm md:size-13"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold tracking-wide text-gold-deep md:text-2xl">
                Krithick <span className="text-gold">Cars</span>
              </span>
              <span className="mt-1 text-[9px] font-bold tracking-[0.2em] text-subtle md:text-[10px]">
                PRE-OWNED · KC ASSURED
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-semibold text-muted transition-colors hover:text-gold-deep">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${DEALER.phoneE164}`}
              className="btn hidden border border-line px-3 text-gold-deep hover:bg-surface-low md:inline-flex"
            >
              <Phone size={16} /> <span className="hidden xl:inline">Call {DEALER.phoneDisplay}</span>
            </a>
            <a href={concierge} target="_blank" rel="noopener noreferrer" className="btn-wa px-3 py-2">
              <WhatsAppIcon />
              <span className="hidden sm:inline">WhatsApp Concierge</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg border border-line p-2 text-ink lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-line-soft bg-surface px-4 pb-4 lg:hidden" aria-label="Mobile">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block border-b border-line-soft py-3 text-sm font-semibold text-ink"
              >
                {n.label}
              </a>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
