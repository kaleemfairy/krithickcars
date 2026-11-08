"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, ExternalLink, LayoutDashboard, LogOut, MessagesSquare, PlusCircle } from "lucide-react";
import { logout } from "@/app/actions/admin";

const ITEMS = [
  { href: "/admin", label: "Overview", short: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory", label: "Inventory", short: "Stock", icon: CarFront },
  { href: "/admin/inventory/new", label: "Add New Vehicle", short: "Add Car", icon: PlusCircle, exact: true },
  { href: "/admin/leads", label: "Enquiries & Leads", short: "Leads", icon: MessagesSquare },
];

function useActive() {
  const path = usePathname();
  return (href: string, exact?: boolean) =>
    exact ? path === href : path === href || (path.startsWith(`${href}/`) && !path.startsWith("/admin/inventory/new"));
}

export function AdminSidebar({ staffName, newLeads }: { staffName: string; newLeads: number }) {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-onyx text-white/75 lg:flex">
      <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="" className="size-10 rounded-full border border-gold bg-onyx p-0.5" />
        <span>
          <span className="block font-display text-lg font-bold text-white">Krithick <span className="text-gold">Cars</span></span>
          <span className="eyebrow text-white/40">Admin Portal</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-gold text-gold-ink" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} /> <span className="flex-1">{label}</span>
              {href === "/admin/leads" && newLeads > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-onyx text-gold" : "bg-whatsapp text-white"}`}>{newLeads}</span>
              )}
            </Link>
          );
        })}
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-white/5 hover:text-white">
          <ExternalLink size={18} /> View Showroom
        </a>
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="text-sm font-bold text-white">{staffName}</p>
        <form action={logout}>
          <button className="mt-2 flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white">
            <LogOut size={14} /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function AdminMobileBar({ newLeads }: { newLeads: number }) {
  const isActive = useActive();
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-onyx px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" className="size-8 rounded-full border border-gold" />
          <span className="font-display text-base font-bold">Krithick Cars <span className="text-gold">Admin</span></span>
        </Link>
        <form action={logout}>
          <button aria-label="Sign out" className="rounded-lg p-2 text-white/60 hover:text-white"><LogOut size={18} /></button>
        </form>
      </header>
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line-soft bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      >
        {ITEMS.map(({ href, short, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${active ? "text-gold-deep" : "text-subtle"}`}>
              {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gold" />}
              <Icon size={20} />
              {short}
              {href === "/admin/leads" && newLeads > 0 && (
                <span className="absolute right-[22%] top-1.5 rounded-full bg-whatsapp px-1.5 text-[9px] text-white">{newLeads}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
