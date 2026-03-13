/**
 * @jest-environment node
 */

import { adminAuth, adminDb } from '@/lib/firebase/admin'

jest.mock('@/lib/firebase/admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
    createUser: jest.fn(),
    generatePasswordResetLink: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}))

jest.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
  },
}))

import { POST } from '../route'

// --- typed mock references ---
const mockVerifyIdToken = adminAuth.verifyIdToken as jest.Mock
const mockCreateUser = adminAuth.createUser as jest.Mock
const mockGeneratePasswordResetLink = adminAuth.generatePasswordResetLink as jest.Mock
const mockCollection = adminDb.collection as jest.Mock

// --- helpers ---

function makeJWT(payload: object): string {
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  return `${encode({ alg: 'RS256' })}.${encode(payload)}.sig`
}

function makeRequest(body: object, sessionToken?: string) {
  return {
    cookies: {
      get: (name: string) =>
        name === 'session' && sessionToken ? { value: sessionToken } : undefined,
    },
    json: jest.fn().mockResolvedValue(body),
  } as any
}

const VALID_BODY = {
  orgName: 'Test Org',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@testorg.com',
  phoneNumber: '+1 555-0100',
}

const ADMIN_TOKEN = makeJWT({ email: 'admin@example.com' })

// Firestore mock chain: collection() → { doc() → { set() }, add() }
const mockSet = jest.fn().mockResolvedValue(undefined)
const mockAdd = jest.fn().mockResolvedValue({ id: 'org-abc123' })
const mockDocRef = { set: mockSet }
const mockDocFn = jest.fn(() => mockDocRef)

describe('POST /api/admin/create-org', () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_EMAILS = 'admin@example.com'

    mockCollection.mockReturnValue({ doc: mockDocFn, add: mockAdd })
    mockVerifyIdToken.mockResolvedValue({ email: 'admin@example.com' })
    mockCreateUser.mockResolvedValue({ uid: 'user-uid-123' })
    mockGeneratePasswordResetLink.mockResolvedValue('https://reset.link/token')
  })

  afterAll(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails
  })

  // ── Auth guard ──────────────────────────────────────────────────────────────

  it('returns 401 when session cookie is absent', async () => {
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when verifyIdToken throws', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('token expired'))
    const res = await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Invalid token')
  })

  it('returns 403 when email is not in ADMIN_EMAILS', async () => {
    mockVerifyIdToken.mockResolvedValue({ email: 'stranger@example.com' })
    const res = await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.error).toBe('Forbidden')
  })

  // ── Validation ──────────────────────────────────────────────────────────────

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ email: 'jane@testorg.com' }, ADMIN_TOKEN))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing required fields')
  })

  it('returns 400 when orgName is missing', async () => {
    const { orgName: _, ...body } = VALID_BODY
    const res = await POST(makeRequest(body, ADMIN_TOKEN))
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is missing', async () => {
    const { email: _, ...body } = VALID_BODY
    const res = await POST(makeRequest(body, ADMIN_TOKEN))
    expect(res.status).toBe(400)
  })

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('returns 200 with uid, orgId, and resetLink on success', async () => {
    const res = await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      success: true,
      uid: 'user-uid-123',
      orgId: 'org-abc123',
      resetLink: 'https://reset.link/token',
    })
  })

  it('creates a Firebase Auth user with the supplied email', async () => {
    await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))
    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'jane@testorg.com' })
    )
  })

  it('creates the auth user with a random UUID as password', async () => {
    await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))
    const [args] = mockCreateUser.mock.calls
    expect(typeof args[0].password).toBe('string')
    expect(args[0].password.length).toBeGreaterThan(0)
  })

  it('writes to the users collection with correct role and fields', async () => {
    await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))

    expect(mockCollection).toHaveBeenCalledWith('users')
    expect(mockDocFn).toHaveBeenCalledWith('user-uid-123')
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane@testorg.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'volunteer_org',
      })
    )
  })

  it('adds a document to volunteer_orgs with org name', async () => {
    await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))

    expect(mockCollection).toHaveBeenCalledWith('volunteer_orgs')
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Org', createdBy: 'admin' })
    )
  })

  it('writes volunteer_org_profiles with orgId and phoneNumber', async () => {
    await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))

    expect(mockCollection).toHaveBeenCalledWith('volunteer_org_profiles')
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-abc123',
        phoneNumber: '+1 555-0100',
      })
    )
  })

  it('defaults phoneNumber to empty string when not provided', async () => {
    const { phoneNumber: _, ...bodyWithoutPhone } = VALID_BODY
    await POST(makeRequest(bodyWithoutPhone, ADMIN_TOKEN))

    const profileSetCall = mockSet.mock.calls.find(
      (args) => args[0].orgId !== undefined
    )
    expect(profileSetCall?.[0].phoneNumber).toBe('')
  })

  it('calls generatePasswordResetLink with the org email', async () => {
    await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))
    expect(mockGeneratePasswordResetLink).toHaveBeenCalledWith('jane@testorg.com')
  })

  it('writes to all three Firestore collections', async () => {
    await POST(makeRequest(VALID_BODY, ADMIN_TOKEN))

    const collections = mockCollection.mock.calls.map(([name]: [string]) => name)
    expect(collections).toContain('users')
    expect(collections).toContain('volunteer_orgs')
    expect(collections).toContain('volunteer_org_profiles')
  })
})
