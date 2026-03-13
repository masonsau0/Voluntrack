import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { App } from 'firebase-admin/app'

let _app: App | undefined

function getAdminApp(): App {
  if (_app) return _app

  const existing = getApps()
  if (existing.length > 0) {
    _app = existing[0]
    return _app
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set')
  }

  _app = initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
  })
  return _app
}

export const adminAuth = getAuth(getAdminApp())
export const adminDb = getFirestore(getAdminApp())
