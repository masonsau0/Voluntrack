/**
 * @jest-environment node
 */

import { adminAuth, adminDb } from "@/lib/firebase/admin"

jest.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}))

import { GET } from "../route"

const mockVerifyIdToken = adminAuth.verifyIdToken as jest.Mock
const mockCollection = adminDb.collection as jest.Mock

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeJWT(payload: object): string {
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  return `${encode({ alg: "RS256" })}.${encode(payload)}.sig`
}

function makeRequest(sessionToken?: string) {
  return {
    cookies: {
      get: (name: string) =>
        name === "session" && sessionToken ? { value: sessionToken } : undefined,
    },
  } as any
}

function makeQuerySnapshot(docs: Array<{ id: string; data: Record<string, any> }>) {
  const snapshots = docs.map((d) => ({ id: d.id, data: () => d.data }))
  return {
    docs: snapshots,
    forEach: (cb: (doc: any) => void) => snapshots.forEach(cb),
  }
}

function makeDocSnapshot(exists: boolean, data?: Record<string, any>) {
  return { exists, data: () => data ?? {} }
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ADMIN_TOKEN = makeJWT({ email: "admin@example.com" })

const SAMPLE_REPORT = {
  id: "report-1",
  data: {
    reporterId: "student-1",
    opportunityId: "opp-1",
    orgId: "org-1",
    reason: "Household chores",
    text: "",
    createdAt: { toDate: () => new Date("2024-01-15T10:00:00Z") },
  },
}

const SAMPLE_REPORT_OTHER = {
  id: "report-2",
  data: {
    reporterId: "student-2",
    opportunityId: "opp-2",
    orgId: "org-2",
    reason: "Other",
    text: "This looks like a paid position disguised as volunteering.",
    createdAt: { toDate: () => new Date("2024-01-16T12:00:00Z") },
  },
}

// ── Setup ─────────────────────────────────────────────────────────────────────

const mockReportsOrderBy = jest.fn()
const mockReportsGet = jest.fn()
const mockResolutionsGet = jest.fn()
const mockOppDocGet = jest.fn()
const mockOppDoc = jest.fn(() => ({ get: mockOppDocGet }))

describe("GET /api/admin/reports", () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_EMAILS = "admin@example.com"

    mockVerifyIdToken.mockResolvedValue({ email: "admin@example.com" })

    mockReportsOrderBy.mockReturnValue({ get: mockReportsGet })
    mockReportsGet.mockResolvedValue(makeQuerySnapshot([]))
    mockResolutionsGet.mockResolvedValue(makeQuerySnapshot([]))
    mockOppDocGet.mockResolvedValue(makeDocSnapshot(true, { title: "Community Garden" }))

    mockCollection.mockImplementation((name: string) => {
      if (name === "reports") return { orderBy: mockReportsOrderBy }
      if (name === "report_resolutions") return { get: mockResolutionsGet }
      if (name === "opportunities") return { doc: mockOppDoc }
      return {}
    })
  })

  afterAll(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails
  })

  // ── Auth guard ──────────────────────────────────────────────────────────────

  it("returns 401 when session cookie is absent", async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it("returns 401 when verifyIdToken throws", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("token expired"))
    const res = await GET(makeRequest(ADMIN_TOKEN))
    expect(res.status).toBe(401)
  })

  it("returns 401 when ADMIN_EMAILS is not set", async () => {
    process.env.ADMIN_EMAILS = ""
    const res = await GET(makeRequest(ADMIN_TOKEN))
    expect(res.status).toBe(401)
  })

  it("returns 401 when email is not in ADMIN_EMAILS", async () => {
    mockVerifyIdToken.mockResolvedValue({ email: "stranger@example.com" })
    const res = await GET(makeRequest(ADMIN_TOKEN))
    expect(res.status).toBe(401)
  })

  // ── Empty state ─────────────────────────────────────────────────────────────

  it("returns empty reports array when there are no reports", async () => {
    const res = await GET(makeRequest(ADMIN_TOKEN))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reports).toEqual([])
  })

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("returns pending reports with opportunityTitle included", async () => {
    mockReportsGet.mockResolvedValue(makeQuerySnapshot([SAMPLE_REPORT]))
    mockOppDocGet.mockResolvedValue(makeDocSnapshot(true, { title: "Food Bank Sorting" }))

    const res = await GET(makeRequest(ADMIN_TOKEN))
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.reports).toHaveLength(1)
    expect(body.reports[0]).toMatchObject({
      id: "report-1",
      reason: "Household chores",
      opportunityTitle: "Food Bank Sorting",
    })
  })

  it("includes the text field when reason is Other", async () => {
    mockReportsGet.mockResolvedValue(makeQuerySnapshot([SAMPLE_REPORT_OTHER]))
    mockOppDocGet.mockResolvedValue(makeDocSnapshot(true, { title: "Test Opp" }))

    const res = await GET(makeRequest(ADMIN_TOKEN))
    const body = await res.json()

    expect(body.reports[0].text).toBe(
      "This looks like a paid position disguised as volunteering."
    )
    expect(body.reports[0].reason).toBe("Other")
  })

  it("falls back to 'Unknown Opportunity' when opportunity doc does not exist", async () => {
    mockReportsGet.mockResolvedValue(makeQuerySnapshot([SAMPLE_REPORT]))
    mockOppDocGet.mockResolvedValue(makeDocSnapshot(false))

    const res = await GET(makeRequest(ADMIN_TOKEN))
    const body = await res.json()

    expect(body.reports[0].opportunityTitle).toBe("Unknown Opportunity")
  })

  it("queries reports with orderBy createdAt desc", async () => {
    await GET(makeRequest(ADMIN_TOKEN))

    expect(mockCollection).toHaveBeenCalledWith("reports")
    expect(mockReportsOrderBy).toHaveBeenCalledWith("createdAt", "desc")
  })

  // ── Filtering resolved reports ──────────────────────────────────────────────

  it("excludes reports that have already been resolved", async () => {
    mockReportsGet.mockResolvedValue(
      makeQuerySnapshot([SAMPLE_REPORT, SAMPLE_REPORT_OTHER])
    )
    mockResolutionsGet.mockResolvedValue(
      makeQuerySnapshot([
        { id: "res-1", data: { reportId: "report-1" } },
      ])
    )
    mockOppDocGet.mockResolvedValue(makeDocSnapshot(true, { title: "Test" }))

    const res = await GET(makeRequest(ADMIN_TOKEN))
    const body = await res.json()

    // report-1 is resolved, only report-2 should be returned
    expect(body.reports).toHaveLength(1)
    expect(body.reports[0].id).toBe("report-2")
  })

  it("returns all reports when none are resolved", async () => {
    mockReportsGet.mockResolvedValue(
      makeQuerySnapshot([SAMPLE_REPORT, SAMPLE_REPORT_OTHER])
    )
    mockOppDocGet.mockResolvedValue(makeDocSnapshot(true, { title: "Test" }))

    const res = await GET(makeRequest(ADMIN_TOKEN))
    const body = await res.json()

    expect(body.reports).toHaveLength(2)
  })

  it("returns empty array when all reports are resolved", async () => {
    mockReportsGet.mockResolvedValue(makeQuerySnapshot([SAMPLE_REPORT]))
    mockResolutionsGet.mockResolvedValue(
      makeQuerySnapshot([{ id: "res-1", data: { reportId: "report-1" } }])
    )

    const res = await GET(makeRequest(ADMIN_TOKEN))
    const body = await res.json()

    expect(body.reports).toHaveLength(0)
  })

  it("includes the createdAt ISO string in the response", async () => {
    mockReportsGet.mockResolvedValue(makeQuerySnapshot([SAMPLE_REPORT]))
    mockOppDocGet.mockResolvedValue(makeDocSnapshot(true, { title: "Test" }))

    const res = await GET(makeRequest(ADMIN_TOKEN))
    const body = await res.json()

    expect(body.reports[0].createdAt).toBe("2024-01-15T10:00:00.000Z")
  })
})
