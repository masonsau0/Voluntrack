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
  // Opportunity preview fields
  orgName: string
  description: string
  location: string
  hours: number
  date: string
  time: string
  spotsLeft: number
  totalSpots: number
  category: string
  commitment: string
  skills: string[]
  image: string
}

async function verifyAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) {
    console.warn('[admin/reports] No session cookie found')
    return null
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie)
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)
    if (!adminEmails.includes(decodedToken.email ?? '')) {
      console.warn('[admin/reports] Email not in ADMIN_EMAILS:', decodedToken.email)
      return null
    }
    return decodedToken
  } catch (err) {
    console.error('[admin/reports] verifyIdToken failed:', err)
    return null
  }
}

export async function GET(request: NextRequest) {
  const decoded = await verifyAdmin(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
        let oppData: Record<string, unknown> = {}
        try {
          const oppDoc = await adminDb.collection('opportunities').doc(data.opportunityId).get()
          if (oppDoc.exists) {
            oppData = oppDoc.data() ?? {}
            opportunityTitle = (oppData.title as string) ?? opportunityTitle
          }
        } catch {
          // leave defaults
        }
        return {
          id: d.id,
          reporterId: data.reporterId,
          opportunityId: data.opportunityId,
          orgId: data.orgId,
          reason: data.reason ?? '',
          text: data.text ?? '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          opportunityTitle,
          orgName: oppData.organization ?? '',
          description: oppData.description ?? '',
          location: oppData.location ?? '',
          hours: oppData.hours ?? 0,
          date: oppData.date ?? '',
          time: oppData.time ?? '',
          spotsLeft: oppData.spotsLeft ?? 0,
          totalSpots: oppData.totalSpots ?? 0,
          category: oppData.category ?? '',
          commitment: oppData.commitment ?? '',
          skills: oppData.skills ?? [],
          image: oppData.image ?? '/icon.svg',
        }
      })
    )

    return NextResponse.json({ reports })
  } catch (err) {
    console.error('[admin/reports] Firestore error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
