import { readFile } from "node:fs/promises";
import path from "node:path";
import { SAFE_NAME, UPLOAD_DIR } from "@/lib/uploads";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

export async function GET(_: Request, ctx: RouteContext<"/api/uploads/[name]">) {
  const { name } = await ctx.params;
  if (!SAFE_NAME.test(name)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "content-type": MIME[name.split(".").pop()!],
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
