import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, SESSION_SECONDS, verifyToken } from "./token";
import { db } from "./db";

export async function getAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = await verifyToken(token);
  if (!session) return null;
  // Revalida contra la base: si borran al admin, la sesión deja de servir.
  return db.admin.findUnique({ where: { id: session.id }, select: { id: true, email: true } });
}

/** Úsalo al inicio de cada página y de cada server action del panel. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}
