import { NextRequest, NextResponse } from "next/server"

/**
 * Ensures a cache id cookie is set, so the data layer can scope Next.js
 * cache tags per-visitor (see lib/data/cookies.ts).
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  if (request.cookies.get("_medusa_cache_id")) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
    maxAge: 60 * 60 * 24,
  })
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
