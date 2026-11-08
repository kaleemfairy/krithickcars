import { EMPTY_VEHICLE, VehicleForm } from "@/components/admin/VehicleForm";

export const metadata = { title: "Add New Vehicle" };

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-gold-deep">Intake Studio</p>
        <h1 className="font-display text-3xl font-semibold">Add New Vehicle</h1>
        <p className="mt-1 text-sm text-muted">Save a draft anytime. Publishing needs all 6 photo angles and the inspection sign-off.</p>
      </div>
      <VehicleForm initial={EMPTY_VEHICLE} />
    </div>
  );
}
