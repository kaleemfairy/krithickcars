"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Plus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { PHOTO_ANGLES } from "@/lib/constants";
import type { VehicleImage } from "@/lib/vehicle";
import { CarImage } from "@/components/showroom/CarImage";

/** Downscale big phone photos (max 2000px, JPEG ~85%) so uploads stay fast and under host limits. */
async function shrink(file: File): Promise<File> {
  const MAX = 2000;
  if (file.size < 1.5 * 1024 * 1024 || !("createImageBitmap" in window)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/.w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

async function upload(original: File): Promise<string> {
  const file = await shrink(original);
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? `Upload failed (${res.status})`);
  return json.url;
}

function Slot({ label, image, required, onFile, onRemove }: {
  label: string; image?: VehicleImage; required?: boolean; onFile: (f: File) => Promise<void>; onRemove?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);

  async function handle(f?: File | null) {
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      await onFile(f);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void handle(e.dataTransfer.files[0]); }}
        className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-dashed transition ${
          over ? "border-gold bg-gold/10" : image ? "border-transparent" : err ? "border-danger/60 bg-danger/5" : "border-line bg-surface-low hover:border-gold"
        }`}
      >
        {image ? (
          <>
            <CarImage src={image.url} alt={label} className="h-full w-full" />
            <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-onyx/70 to-transparent p-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
              <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-white/90 p-1.5 text-ink" aria-label={`Replace ${label}`}><RefreshCw size={15} /></button>
              {onRemove && <button type="button" onClick={onRemove} className="rounded-lg bg-white/90 p-1.5 text-danger" aria-label={`Remove ${label}`}><Trash2 size={15} /></button>}
            </div>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center text-subtle">
            {busy ? <Loader2 className="animate-spin text-gold-deep" /> : (
              <>
                <span className="hidden md:block"><UploadCloud size={24} /></span>
                <span className="md:hidden"><Camera size={24} /></span>
                <span className="text-[11px] font-semibold">Drop, tap or shoot</span>
              </>
            )}
          </button>
        )}
        {busy && image && <div className="absolute inset-0 flex items-center justify-center bg-onyx/50"><Loader2 className="animate-spin text-white" /></div>}
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => void handle(e.target.files?.[0])}
        />
      </div>
      <span className="flex items-center justify-between text-xs font-bold">
        <span>{label}{required && <span className="text-danger"> *</span>}</span>
        {image && <span className="text-whatsapp-dark">✓</span>}
      </span>
      {err && <span className="text-[11px] text-danger">{err}</span>}
    </div>
  );
}

type Update = (fn: (prev: VehicleImage[]) => VehicleImage[]) => void;

export function PhotoSlots({ images, onChange, error }: {
  images: VehicleImage[]; onChange: Update; error?: string;
}) {
  const extras = images.filter((i) => i.angle === "extra");
  const done = PHOTO_ANGLES.filter((a) => images.some((i) => i.angle === a.key)).length;
  const extraInput = useRef<HTMLInputElement>(null);
  const [extraBusy, setExtraBusy] = useState(false);

  const setAngle = async (angle: string, f: File) => {
    const url = await upload(f);
    onChange((prev) => [...prev.filter((i) => i.angle !== angle), { angle: angle as VehicleImage["angle"], url }]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-high">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(done / PHOTO_ANGLES.length) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-muted">{done}/{PHOTO_ANGLES.length} mandatory angles</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PHOTO_ANGLES.map((a) => (
          <Slot
            key={a.key}
            label={a.label}
            required
            image={images.find((i) => i.angle === a.key)}
            onFile={(f) => setAngle(a.key, f)}
            onRemove={() => onChange((prev) => prev.filter((i) => i.angle !== a.key))}
          />
        ))}
      </div>

      {extras.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {extras.map((x) => (
            <div key={x.url} className="relative aspect-square overflow-hidden rounded-lg">
              <CarImage src={x.url} alt="Extra photo" className="h-full w-full" />
              <button type="button" onClick={() => onChange((prev) => prev.filter((i) => i.url !== x.url))} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-danger" aria-label="Remove extra photo"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        disabled={extraBusy || images.length >= 20}
        onClick={() => extraInput.current?.click()}
        className="btn mt-4 border border-dashed border-line text-xs text-muted hover:border-gold"
      >
        {extraBusy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add extra angles (optional)
      </button>
      <input
        ref={extraInput}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])].slice(0, 20 - images.length);
          if (!files.length) return;
          setExtraBusy(true);
          try {
            const urls = await Promise.all(files.map(upload));
            onChange((prev) => [...prev, ...urls.map((url) => ({ angle: "extra" as const, url }))]);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setExtraBusy(false);
            e.target.value = "";
          }
        }}
      />
      {error && <p className="mt-3 text-sm font-semibold text-danger">{error}</p>}
    </div>
  );
}
