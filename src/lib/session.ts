/**
 * Stateless staff sessions: a signed (HS256) JWT in an httpOnly cookie.
 * `verifySessionToken` is edge-safe so proxy.ts can use it for the optimistic
 * redirect; pages and actions must still call `requireStaff()` from auth.ts.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "kc_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // one showroom shift

export type SessionPayload = { sub: string; email: string; name: string };

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random string of 32+ characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(p: SessionPayload): Promise<string> {
  return new SignJWT({ email: p.email, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { sub: payload.sub, email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}
