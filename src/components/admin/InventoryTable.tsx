import Link from "next/link";
import { BadgeCheck, Pencil } from "lucide-react";
import { PHOTO_ANGLES, label } from "@/lib/constants";
import { formatKm, formatLakhs } from "@/lib/format";
import { coverImage, type Vehicle } from "@/lib/vehicle";
import { CarImage } from "@/components/showroom/CarImage";
import { StatusSelect } from "./StatusSelect";

const readyToPublish = (v: Vehicle) => PHOTO_ANGLES.every((a) => v.images.some((i) => i.angle === a.key));

export function InventoryTable({ vehicles, leadCounts }: { vehicles: Vehicle[]; leadCounts: Record<string, number> }) {
  if (!vehicles.length) {
    return <p className="card p-8 text-center text-sm text-muted">No vehicles here yet.</p>;
  }
  return (
    <>
      {/* Desktop table */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line-soft bg-surface-low text-[11px] uppercase tracking-wider text-subtle">
            <tr>
              <th className="px-4 py-3 font-bold">Vehicle</th>
              <th className="px-4 py-3 font-bold">Reg / RTO</th>
              <th className="px-4 py-3 font-bold">Specs</th>
              <th className="px-4 py-3 text-right font-bold">Asking / Floor</th>
              <th className="px-4 py-3 text-center font-bold">Leads</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-2 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-surface-low/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CarImage src={coverImage(v)} alt="" className="h-11 w-16 shrink-0 rounded" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-bold">
                        {v.year} {v.make} {v.model}
                        {v.isCertified && <BadgeCheck size={14} className="text-gold-deep" aria-label="KC Certified" />}
                      </p>
                      <p className="truncate text-xs text-muted">{v.variant}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs"><p className="font-bold">{v.regNumber}</p><p className="text-muted">{v.rtoOffice}</p></td>
                <td className="px-4 py-3 text-xs text-muted">{formatKm(v.odometerKm)} · {label(v.fuelType)} · {label(v.transmission)}</td>
                <td className="px-4 py-3 text-right">
                  <p className="whitespace-nowrap font-bold">{formatLakhs(v.askingPrice)}</p>
                  <p className="whitespace-nowrap text-xs text-muted">Floor {formatLakhs(v.floorPrice)}</p>
                </td>
                <td className="px-4 py-3 text-center font-bold">{leadCounts[v.id] ?? 0}</td>
                <td className="px-4 py-3"><StatusSelect id={v.id} status={v.status} canGoLive={readyToPublish(v)} /></td>
                <td className="px-2 py-3">
                  <Link href={`/admin/inventory/${v.id}`} className="inline-flex rounded-lg p-2 text-muted hover:bg-surface-mid hover:text-ink" aria-label={`Edit ${v.make} ${v.model}`}>
                    <Pencil size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="grid gap-3 md:hidden">
        {vehicles.map((v) => (
          <li key={v.id} className="card flex gap-3 p-3">
            <CarImage src={coverImage(v)} alt="" className="h-20 w-24 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/inventory/${v.id}`} className="block font-bold leading-tight">{v.year} {v.make} {v.model}</Link>
              <p className="truncate text-xs text-muted">{v.regNumber} · {formatKm(v.odometerKm)}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-gold-deep">{formatLakhs(v.askingPrice)}</span>
                <StatusSelect id={v.id} status={v.status} canGoLive={readyToPublish(v)} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
