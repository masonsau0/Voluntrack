/**
 * @jest-environment node
 */

// Mock next/server before importing middleware
const mockRedirect = jest.fn((url: URL) => ({ type: 'redirect', url: url.href }))
const mockNext = jest.fn(() => ({ type: 'next' }))

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
  },
}))

import { middleware } from '../middleware'

// --- helpers ---

/** Build a base64url-encoded JWT with a known payload (no real signature). */
function makeJWT(payload: object): string {
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

  const header = encode({ alg: 'RS256', typ: 'JWT' })
  const body = encode(payload)
  return `${header}.${body}.fake-signature`
}

function makeRequest(options: { cookie?: string; url?: string } = {}) {
  const url = options.url ?? 'http://localhost/admin/create-org'
  return {
    cookies: {
      get: (name: string) =>
        name === 'session' && options.cookie ? { value: options.cookie } : undefined,
    },
    url,
  } as any
}

describe('Admin middleware', () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_EMAILS = 'admin@example.com,other@example.com'
  })

  afterAll(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails
  })

  it('redirects to /login when session cookie is absent', () => {
    middleware(makeRequest())

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectArg: URL = mockRedirect.mock.calls[0][0]
    expect(redirectArg.pathname).toBe('/login')
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('redirects to /login when JWT email is not in ADMIN_EMAILS', () => {
    const token = makeJWT({ email: 'stranger@example.com' })

    middleware(makeRequest({ cookie: token }))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('redirects to /login when JWT payload has no email field', () => {
    const token = makeJWT({ sub: 'uid-123' })

    middleware(makeRequest({ cookie: token }))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('redirects to /login when session cookie is not a valid JWT', () => {
    middleware(makeRequest({ cookie: 'not-a-jwt' }))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('calls NextResponse.next() when email matches ADMIN_EMAILS', () => {
    const token = makeJWT({ email: 'admin@example.com' })

    middleware(makeRequest({ cookie: token }))

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('accepts any email listed in comma-separated ADMIN_EMAILS', () => {
    const token = makeJWT({ email: 'other@example.com' })

    middleware(makeRequest({ cookie: token }))

    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  it('redirects when ADMIN_EMAILS env var is empty', () => {
    process.env.ADMIN_EMAILS = ''
    const token = makeJWT({ email: 'admin@example.com' })

    middleware(makeRequest({ cookie: token }))

    expect(mockRedirect).toHaveBeenCalledTimes(1)
  })

  it('trims whitespace around emails in ADMIN_EMAILS', () => {
    process.env.ADMIN_EMAILS = '  admin@example.com  ,  other@example.com  '
    const token = makeJWT({ email: 'admin@example.com' })

    middleware(makeRequest({ cookie: token }))

    expect(mockNext).toHaveBeenCalledTimes(1)
  })
})
