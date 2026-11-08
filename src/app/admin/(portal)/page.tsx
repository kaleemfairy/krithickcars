import Link from "next/link";
import { ArrowRight, CarFront, ClipboardCheck, MessagesSquare, PlusCircle, Trophy } from "lucide-react";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { db } from "@/lib/db";
import { formatLakhs } from "@/lib/format";
import { parseVehicle } from "@/lib/vehicle";

export const metadata = { title: "Overview" };

function Metric({ icon: Icon, label, value, hint, tone = "default" }: {
  icon: typeof CarFront; label: string; value: string | number; hint: string; tone?: "default" | "wa" | "gold";
}) {
  const ring = tone === "wa" ? "bg-whatsapp/12 text-whatsapp-dark" : tone === "gold" ? "bg-gold/15 text-gold-deep" : "bg-surface-mid text-ink";
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${ring}`}><Icon size={22} /></span>
      <div>
        <p className="eyebrow text-subtle">{label}</p>
        <p className="mt-0.5 font-display text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [live, inspection, newLeads, waLeads, soldMonth, recentRows, leadGroups] = await Promise.all([
    db.vehicle.aggregate({ where: { status: "LIVE" }, _count: true, _sum: { askingPrice: true } }),
    db.vehicle.count({ where: { status: { in: ["UNDER_INSPECTION", "DRAFT"] } } }),
    db.lead.count({ where: { status: "NEW" } }),
    db.lead.count({ where: { status: "NEW", channel: "WHATSAPP" } }),
    db.vehicle.aggregate({ where: { status: "SOLD", soldAt: { gte: monthStart } }, _count: true, _sum: { askingPrice: true } }),
    db.vehicle.findMany({ orderBy: { updatedAt: "desc" }, take: 8 }),
    db.lead.groupBy({ by: ["vehicleId"], _count: true }),
  ]);
  const leadCounts = Object.fromEntries(leadGroups.filter((g) => g.vehicleId).map((g) => [g.vehicleId!, g._count]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep">Dashboard</p>
          <h1 className="font-display text-3xl font-semibold">Showroom Overview</h1>
        </div>
        <Link href="/admin/inventory/new" className="btn-gold"><PlusCircle size={18} /> Add New Vehicle</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CarFront} label="Active in stock" value={live._count} hint={`${formatLakhs(live._sum.askingPrice ?? 0)} live value`} tone="gold" />
        <Metric icon={MessagesSquare} label="Fresh leads" value={newLeads} hint={`${waLeads} via WhatsApp`} tone="wa" />
        <Metric icon={Trophy} label="Sold this month" value={soldMonth._count} hint={formatLakhs(soldMonth._sum.askingPrice ?? 0)} />
        <Metric icon={ClipboardCheck} label="In pipeline" value={inspection} hint="Drafts & under inspection" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Inventory</h2>
          <Link href="/admin/inventory" className="flex items-center gap-1 text-sm font-bold text-gold-deep hover:underline">All stock <ArrowRight size={14} /></Link>
        </div>
        <InventoryTable vehicles={recentRows.map(parseVehicle)} leadCounts={leadCounts} />
      </section>
    </div>
  );
}
