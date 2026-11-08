import Link from "next/link";
import { LeadRow, type LeadView } from "@/components/admin/LeadRow";
import { LEAD_STATUSES, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { vehicleTitle } from "@/lib/vehicle";

export const metadata = { title: "Enquiries & Leads" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (LEAD_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const [rows, counts] = await Promise.all([
    db.lead.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { vehicle: { select: { year: true, make: true, model: true, variant: true, regNumber: true } } },
    }),
    db.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const leads: LeadView[] = rows.map((l) => ({
    id: l.id, customerName: l.customerName, customerPhone: l.customerPhone, channel: l.channel, kind: l.kind,
    status: l.status, message: l.message, createdAt: l.createdAt.toISOString(),
    vehicle: l.vehicle ? { title: vehicleTitle(l.vehicle), regNumber: l.vehicle.regNumber } : null,
  }));
  const n = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-gold-deep">CRM</p>
        <h1 className="font-display text-3xl font-semibold">Enquiries &amp; Leads</h1>
        <p className="mt-1 text-sm text-muted">WhatsApp clicks arrive as “WhatsApp visitor” — add their name and number once they message you.</p>
      </div>
      <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" aria-label="Filter by status">
        {[{ key: "", label: "All", n: counts.reduce((a, c) => a + c._count, 0) }, ...LEAD_STATUSES.map((s) => ({ key: s, label: label(s), n: n(s) }))].map((t) => (
          <Link key={t.key || "all"} href={t.key ? `/admin/leads?status=${t.key}` : "/admin/leads"}
            aria-current={status === t.key ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold ${status === t.key ? "border-onyx bg-onyx text-white" : "border-line bg-surface text-muted hover:border-gold"}`}>
            {t.label} <span className="opacity-60">{t.n}</span>
          </Link>
        ))}
      </nav>
      {leads.length ? (
        <ul className="grid gap-3">{leads.map((l) => <LeadRow key={l.id} lead={l} />)}</ul>
      ) : (
        <p className="card p-8 text-center text-sm text-muted">No leads in this view.</p>
      )}
    </div>
  );
}
