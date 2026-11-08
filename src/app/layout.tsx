import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { DEALER } from "@/lib/constants";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${DEALER.name} | Certified Pre-Owned Cars in Chennai`, template: `%s | ${DEALER.name}` },
  description: `${DEALER.tagline}. 160-point inspected, 100% non-accidental pre-owned cars with RC transfer assistance on GST Road, Chennai.`,
  icons: { icon: "/logo.jpg" },
};

export const viewport: Viewport = { themeColor: "#0f172a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
