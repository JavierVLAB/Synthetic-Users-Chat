import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth-token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protege todas las rutas excepto:
     *  - /login
     *  - /_next (assets de Next.js)
     *  - /fonts, /logo.png, favicon.ico (assets estáticos)
     */
    "/((?!login$|login/|api/|_next/|fonts/|logo\\.png|favicon\\.ico).*)",
  ],
};
