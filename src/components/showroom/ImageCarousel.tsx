"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PHOTO_ANGLES } from "@/lib/constants";
import type { VehicleImage } from "@/lib/vehicle";
import { CarImage } from "./CarImage";

const angleLabel = (a: string) => PHOTO_ANGLES.find((p) => p.key === a)?.label ?? "Photo";

export function ImageCarousel({
  images, alt, className = "h-56", showThumbs = false, children,
}: {
  images: VehicleImage[]; alt: string; className?: string; showThumbs?: boolean; children?: React.ReactNode;
}) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const current = images[i];

  return (
    <div>
      <div className={`group/car relative overflow-hidden bg-surface-high ${className}`}>
        <CarImage
          key={current?.url}
          src={current?.url}
          alt={`${alt} — ${angleLabel(current?.angle ?? "")}`}
          className="h-full w-full transition-transform duration-500 group-hover/car:scale-[1.03]"
        />
        {children}
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-onyx/60 p-1.5 text-white opacity-90 backdrop-blur transition hover:bg-onyx md:opacity-0 md:group-hover/car:opacity-100">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-onyx/60 p-1.5 text-white opacity-90 backdrop-blur transition hover:bg-onyx md:opacity-0 md:group-hover/car:opacity-100">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((img, k) => (
                <span key={img.url + k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-gold" : "w-1.5 bg-white/70"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {showThumbs && n > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, k) => (
            <button
              key={img.url + k}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show ${angleLabel(img.angle)}`}
              aria-current={k === i}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${k === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <CarImage src={img.url} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
