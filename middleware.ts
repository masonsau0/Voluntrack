import { NextRequest, NextResponse } from 'next/server'

function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const decoded = atob(segment.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = decodeJWTPayload(sessionCookie)
  const email = payload?.email as string | undefined

  if (!email || !adminEmails.includes(email)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
