"use client";

import { useState } from "react";
import { Car } from "lucide-react";

/** Plain <img> (sources may be remote CDN or local uploads) with a graceful fallback. */
export function CarImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-surface-high to-surface-mid text-subtle ${className}`}>
        <Car size={48} strokeWidth={1.2} aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={`object-cover ${className}`} />
  );
}
