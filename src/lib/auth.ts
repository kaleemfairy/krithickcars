import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken, verifySessionToken } from "./session";

/** Returns the signed-in staff member (verified against the DB), or null. */
export const getStaff = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const user = await db.staffUser.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true },
  });
  return user;
});

/** Use at the top of every admin page, server action and route handler. */
export async function requireStaff() {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

export async function startSession(user: { id: string; email: string; name: string }) {
  const token = await createSessionToken({ sub: user.id, email: user.email, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
