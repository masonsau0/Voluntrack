import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { token } = body

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session')
  return response
}
