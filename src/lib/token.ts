// Compatible con el runtime Edge (lo usa el middleware): solo depende de jose.
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "patio_admin";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("Falta AUTH_SECRET (mínimo 16 caracteres). Genera uno con: openssl rand -base64 32");
  return new TextEncoder().encode(s);
}

export async function signToken(adminId: string, email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined): Promise<{ id: string; email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload["email"] !== "string") return null;
    return { id: payload.sub, email: payload["email"] };
  } catch {
    return null;
  }
}
