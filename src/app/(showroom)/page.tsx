import { Suspense } from "react";
import { SearchX, Sparkles } from "lucide-react";
import { FilterBar } from "@/components/showroom/FilterBar";
import { Hero } from "@/components/showroom/Hero";
import { ContactSection, DeliveriesSection, SectionHead, SellCarSection, TrustSection } from "@/components/showroom/Sections";
import { VehicleCard } from "@/components/showroom/VehicleCard";
import { getFeaturedVehicle, parseFilters, searchInventory } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);
  const [featured, vehicles] = await Promise.all([getFeaturedVehicle(), searchInventory(filters)]);

  return (
    <main>
      <Hero featured={featured} />

      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 md:px-8">
        <Suspense>
          <FilterBar total={vehicles.length} />
        </Suspense>
      </section>

      <section id="inventory" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 md:px-8">
        <SectionHead eyebrow="Direct Lot Inventory" title="Certified Pre-Owned Selection">
          Every vehicle undergoes a 160-point mechanical evaluation, with transparent service records and
          hassle-free ownership transfer.
        </SectionHead>

        {vehicles.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <SearchX size={40} className="text-subtle" />
            <p className="text-lg font-bold">No cars match those filters right now</p>
            <p className="max-w-md text-sm text-muted">
              New stock arrives every week. Tell us what you&apos;re looking for on WhatsApp and we&apos;ll source it for you.
            </p>
            <span className="flex items-center gap-1 text-xs font-bold text-gold-deep"><Sparkles size={14} /> Try clearing a filter</span>
          </div>
        )}
      </section>

      <TrustSection />
      <SellCarSection />
      <DeliveriesSection />
      <ContactSection />
    </main>
  );
}
