import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

async function verifyAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) return null

  try {
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie)
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)
    if (!adminEmails.includes(decodedToken.email ?? '')) return null
    return decodedToken
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const decoded = await verifyAdmin(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reportId } = await params
  let body: { action: string; opportunityId: string; opportunityData?: Record<string, unknown> }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { action, opportunityId, opportunityData } = body

  if (!action || !opportunityId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (action === 'remove') {
    await adminDb.collection('opportunities').doc(opportunityId).delete()
  } else if (action === 'edit') {
    if (!opportunityData || Object.keys(opportunityData).length === 0) {
      return NextResponse.json({ error: 'opportunityData required for edit' }, { status: 400 })
    }
    await adminDb.collection('opportunities').doc(opportunityId).update({
      ...opportunityData,
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  // 'allow' takes no action on the opportunity

  // Record the resolution
  await adminDb.collection('report_resolutions').add({
    reportId,
    opportunityId,
    action,
    resolvedAt: FieldValue.serverTimestamp(),
    resolvedBy: decoded.email ?? 'admin',
  })

  return NextResponse.json({ success: true })
}
