import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  // Verify admin via session cookie
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let decodedToken
  try {
    decodedToken = await adminAuth.verifyIdToken(sessionCookie)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (!adminEmails.includes(decodedToken.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { orgName, firstName, lastName, email, phoneNumber } = await request.json()

  if (!orgName || !firstName || !lastName || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create Firebase Auth user with a random password (they'll reset it)
  const userRecord = await adminAuth.createUser({
    email,
    password: crypto.randomUUID(),
    displayName: `${firstName} ${lastName}`,
  })
  const uid = userRecord.uid

  // Create users document
  await adminDb.collection('users').doc(uid).set({
    email,
    firstName,
    lastName,
    role: 'volunteer_org',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  // Create volunteer_orgs document
  const orgRef = await adminDb.collection('volunteer_orgs').add({
    name: orgName,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: 'admin',
  })
  const orgId = orgRef.id

  // Create volunteer_org_profiles document
  await adminDb.collection('volunteer_org_profiles').doc(uid).set({
    orgId,
    phoneNumber: phoneNumber ?? '',
    updatedAt: FieldValue.serverTimestamp(),
  })

  // Generate password reset link so the org can set their own password
  const resetLink = await adminAuth.generatePasswordResetLink(email)

  return NextResponse.json({ success: true, uid, orgId, resetLink })
}
