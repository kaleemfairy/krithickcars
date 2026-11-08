import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaff } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Staff Login", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getStaff()) redirect("/admin");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return (
    <main className="flex min-h-dvh items-center justify-center bg-onyx px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-25"
        style={{ backgroundImage: "radial-gradient(circle at 70% 20%, #d4af37 0%, transparent 50%)" }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" className="size-16 rounded-full border border-gold bg-onyx p-0.5" />
          <h1 className="mt-3 font-display text-2xl font-bold text-white">Krithick <span className="text-gold">Cars</span></h1>
          <p className="eyebrow mt-1 text-white/50">Dealership Admin Portal</p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
