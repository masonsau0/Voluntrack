/**
 * @jest-environment node
 */

// firebase-admin modules must be mocked before admin.ts is loaded.
// jest.mock() calls are hoisted so factories run before any imports.

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(),
  initializeApp: jest.fn(),
  cert: jest.fn(),
}))

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}))

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
}))

import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
const mockCert = cert as jest.MockedFunction<typeof cert>
const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>

const mockApp = { name: '[DEFAULT]' } as any
const mockAuth = { verifyIdToken: jest.fn() } as any
const mockDb = { collection: jest.fn() } as any

describe('Firebase Admin SDK', () => {
  const originalKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  beforeAll(() => {
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({ type: 'service_account', project_id: 'test' })
    mockGetApps.mockReturnValue([])
    mockInitializeApp.mockReturnValue(mockApp)
    mockCert.mockReturnValue({} as any)
    mockGetAuth.mockReturnValue(mockAuth)
    mockGetFirestore.mockReturnValue(mockDb)
  })

  afterAll(() => {
    if (originalKey !== undefined) {
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY = originalKey
    } else {
      delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    }
  })

  it('exports adminAuth returned by getAuth()', () => {
    const { adminAuth } = require('../admin')
    expect(adminAuth).toBe(mockAuth)
  })

  it('exports adminDb returned by getFirestore()', () => {
    const { adminDb } = require('../admin')
    expect(adminDb).toBe(mockDb)
  })

  it('calls cert() with the parsed service account JSON', () => {
    require('../admin')
    expect(mockCert).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'service_account', project_id: 'test' })
    )
  })

  it('reuses an existing app instead of calling initializeApp again', () => {
    // Module is already cached; initializeApp should still be called exactly once
    const initialCallCount = mockInitializeApp.mock.calls.length
    require('../admin')
    expect(mockInitializeApp.mock.calls.length).toBe(initialCallCount)
  })

  it('uses an already-initialised app when getApps() returns one', () => {
    jest.resetModules()
    mockGetApps.mockReturnValue([mockApp])
    mockInitializeApp.mockClear()

    const { adminAuth, adminDb } = require('../admin')

    expect(mockInitializeApp).not.toHaveBeenCalled()
    expect(adminAuth).toBeDefined()
    expect(adminDb).toBeDefined()
  })

  it('throws when FIREBASE_SERVICE_ACCOUNT_KEY is not set', () => {
    jest.resetModules()
    mockGetApps.mockReturnValue([])
    delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    expect(() => require('../admin')).toThrow('FIREBASE_SERVICE_ACCOUNT_KEY')
  })
})
