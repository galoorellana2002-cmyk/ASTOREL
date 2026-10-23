import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/token";

// Primera barrera para /admin/*. Cada página y acción vuelve a validar con requireAdmin().
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const session = await verifyToken(req.cookies.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
