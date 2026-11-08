import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { VEHICLE_STATUSES, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { parseVehicle } from "@/lib/vehicle";

export const metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (VEHICLE_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const [rows, counts, leadGroups] = await Promise.all([
    db.vehicle.findMany({ where: status ? { status } : {}, orderBy: { updatedAt: "desc" } }),
    db.vehicle.groupBy({ by: ["status"], _count: true }),
    db.lead.groupBy({ by: ["vehicleId"], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((a, c) => a + c._count, 0);
  const leadCounts = Object.fromEntries(leadGroups.filter((g) => g.vehicleId).map((g) => [g.vehicleId!, g._count]));

  const tabs = [{ key: "", label: "All", n: total }, ...VEHICLE_STATUSES.map((s) => ({ key: s, label: label(s), n: countOf(s) }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep">Inventory Management</p>
          <h1 className="font-display text-3xl font-semibold">All Stock</h1>
        </div>
        <Link href="/admin/inventory/new" className="btn-gold"><PlusCircle size={18} /> Add New Vehicle</Link>
      </div>
      <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" aria-label="Filter by status">
        {tabs.map((t) => (
          <Link
            key={t.key || "all"}
            href={t.key ? `/admin/inventory?status=${t.key}` : "/admin/inventory"}
            aria-current={status === t.key ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold ${status === t.key ? "border-onyx bg-onyx text-white" : "border-line bg-surface text-muted hover:border-gold"}`}
          >
            {t.label} <span className="opacity-60">{t.n}</span>
          </Link>
        ))}
      </nav>
      <InventoryTable vehicles={rows.map(parseVehicle)} leadCounts={leadCounts} />
    </div>
  );
}
