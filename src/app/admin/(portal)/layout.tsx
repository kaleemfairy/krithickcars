import type { Metadata } from "next";
import { AdminMobileBar, AdminSidebar } from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · KC Admin" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const newLeads = await db.lead.count({ where: { status: "NEW" } });
  return (
    <div className="flex min-h-dvh bg-surface-low">
      <AdminSidebar staffName={staff.name} newLeads={newLeads} />
      <div className="min-w-0 flex-1">
        <AdminMobileBar newLeads={newLeads} />
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 lg:pb-12">{children}</div>
      </div>
    </div>
  );
}
