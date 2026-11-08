import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

/**
 * Photo storage.
 * - On Vercel (BLOB_READ_WRITE_TOKEN set): Vercel Blob, returns a public https URL.
 * - Locally: ./uploads on disk, served by /api/uploads/[name].
 */
export const UPLOAD_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
// Vercel functions accept ~4.5 MB request bodies; the browser downsizes photos before upload.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Only names we generated: 24 hex chars + known extension. */
export const SAFE_NAME = /^[a-f0-9]{24}\.(jpg|png|webp|avif)$/;

export async function storeImage(name: string, bytes: Buffer, contentType: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`vehicles/${name}`, bytes, { access: "public", contentType, addRandomSuffix: false });
    return blob.url;
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name), bytes);
  return `/api/uploads/${name}`;
}
