/**
 * @jest-environment node
 */

import { POST, DELETE } from '../route'

// Helper to build a minimal request that the route handler can read
function makePostRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('POST /api/auth/session', () => {
  it('returns 200 and sets session cookie for a valid token', async () => {
    const req = makePostRequest({ token: 'valid-id-token' })
    const res = await POST(req)

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ success: true })

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('session=valid-id-token')
  })

  it('returns 400 when token is missing', async () => {
    const req = makePostRequest({})
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data).toEqual({ error: 'Missing token' })
  })

  it('returns 400 when token is not a string', async () => {
    const req = makePostRequest({ token: 123 })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('sets httpOnly flag on the session cookie', async () => {
    const req = makePostRequest({ token: 'test-token' })
    const res = await POST(req)

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toMatch(/HttpOnly/i)
  })

  it('sets SameSite=Lax on the session cookie', async () => {
    const req = makePostRequest({ token: 'test-token' })
    const res = await POST(req)

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toMatch(/SameSite=Lax/i)
  })

  it('sets Max-Age on the session cookie', async () => {
    const req = makePostRequest({ token: 'test-token' })
    const res = await POST(req)

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toMatch(/Max-Age=/i)
  })
})

describe('DELETE /api/auth/session', () => {
  it('returns 200', async () => {
    const res = await DELETE()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ success: true })
  })

  it('clears the session cookie', async () => {
    const res = await DELETE()
    const setCookie = res.headers.get('set-cookie')
    // Cookie is cleared by setting Max-Age=0 or expires in the past
    expect(setCookie).toMatch(/session=;|session=$/i)
  })
})
