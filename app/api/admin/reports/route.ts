import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export interface AdminReport {
  id: string
  reporterId: string
  opportunityId: string
  orgId: string
  reason: string
  text: string
  createdAt: string
  opportunityTitle: string
}

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

export async function GET(request: NextRequest) {
  const decoded = await verifyAdmin(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all reports ordered newest-first
  const reportsSnap = await adminDb
    .collection('reports')
    .orderBy('createdAt', 'desc')
    .get()

  // Fetch resolved report IDs
  const resolutionsSnap = await adminDb.collection('report_resolutions').get()
  const resolvedIds = new Set<string>()
  resolutionsSnap.forEach((d) => resolvedIds.add(d.data().reportId))

  // Filter to pending only
  const pending = reportsSnap.docs.filter((d) => !resolvedIds.has(d.id))

  // Fetch opportunity titles in parallel
  const reports: AdminReport[] = await Promise.all(
    pending.map(async (d) => {
      const data = d.data()
      let opportunityTitle = 'Unknown Opportunity'
      try {
        const oppDoc = await adminDb.collection('opportunities').doc(data.opportunityId).get()
        if (oppDoc.exists) {
          opportunityTitle = oppDoc.data()?.title ?? opportunityTitle
        }
      } catch {
        // leave default title
      }
      return {
        id: d.id,
        reporterId: data.reporterId,
        opportunityId: data.opportunityId,
        orgId: data.orgId,
        reason: data.reason,
        text: data.text ?? '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        opportunityTitle,
      }
    })
  )

  return NextResponse.json({ reports })
}
