import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getStaff } from "@/lib/auth";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, storeImage } from "@/lib/uploads";

/** Accepts one image (multipart field "file"), returns { url }. Staff only. */
export async function POST(req: Request) {
  if (!(await getStaff())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const ext = IMAGE_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, WebP or AVIF photo" }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Photo is larger than 4 MB" }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  // Verify magic bytes so a renamed file can't masquerade as an image.
  const sig = bytes.subarray(0, 12);
  const looksRight =
    (ext === "jpg" && sig[0] === 0xff && sig[1] === 0xd8) ||
    (ext === "png" && sig.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) ||
    (ext === "webp" && sig.subarray(8, 12).toString() === "WEBP") ||
    (ext === "avif" && sig.subarray(4, 8).toString() === "ftyp");
  if (!looksRight) return NextResponse.json({ error: "File content isn't a valid image" }, { status: 415 });

  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const url = await storeImage(name, bytes, file.type);
  return NextResponse.json({ url });
}
