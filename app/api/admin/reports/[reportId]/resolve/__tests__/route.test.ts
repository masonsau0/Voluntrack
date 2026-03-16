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

jest.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: jest.fn(() => ({ _methodName: "serverTimestamp" })),
  },
}))

import { POST } from "../route"

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

function makeRequest(body: object, sessionToken?: string) {
  return {
    cookies: {
      get: (name: string) =>
        name === "session" && sessionToken ? { value: sessionToken } : undefined,
    },
    json: jest.fn().mockResolvedValue(body),
  } as any
}

function makeParams(reportId: string) {
  return { params: Promise.resolve({ reportId }) }
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ADMIN_TOKEN = makeJWT({ email: "admin@example.com" })
const REPORT_ID = "report-abc"
const OPP_ID = "opp-xyz"

// ── Setup ─────────────────────────────────────────────────────────────────────

const mockDelete = jest.fn()
const mockUpdate = jest.fn()
const mockAdd = jest.fn()
const mockOppDoc = jest.fn(() => ({ delete: mockDelete, update: mockUpdate }))

describe("POST /api/admin/reports/[reportId]/resolve", () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_EMAILS = "admin@example.com"

    mockVerifyIdToken.mockResolvedValue({ email: "admin@example.com" })
    mockDelete.mockResolvedValue(undefined)
    mockUpdate.mockResolvedValue(undefined)
    mockAdd.mockResolvedValue({ id: "resolution-1" })

    mockCollection.mockImplementation((name: string) => {
      if (name === "opportunities") return { doc: mockOppDoc }
      if (name === "report_resolutions") return { add: mockAdd }
      return {}
    })
  })

  afterAll(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails
  })

  // ── Auth guard ──────────────────────────────────────────────────────────────

  it("returns 401 when session cookie is absent", async () => {
    const res = await POST(
      makeRequest({ action: "allow", opportunityId: OPP_ID }),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(401)
  })

  it("returns 401 when verifyIdToken throws", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("expired"))
    const res = await POST(
      makeRequest({ action: "allow", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(401)
  })

  it("returns 401 when email is not in ADMIN_EMAILS", async () => {
    mockVerifyIdToken.mockResolvedValue({ email: "other@example.com" })
    const res = await POST(
      makeRequest({ action: "allow", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(401)
  })

  // ── Validation ──────────────────────────────────────────────────────────────

  it("returns 400 when action is missing", async () => {
    const res = await POST(
      makeRequest({ opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(400)
  })

  it("returns 400 when opportunityId is missing", async () => {
    const res = await POST(
      makeRequest({ action: "allow" }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(400)
  })

  it("returns 400 when action is edit but opportunityData is empty", async () => {
    const res = await POST(
      makeRequest({ action: "edit", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(400)
  })

  // ── allow action ────────────────────────────────────────────────────────────

  it("allow: returns 200 without touching the opportunity", async () => {
    const res = await POST(
      makeRequest({ action: "allow", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(200)
    expect(mockDelete).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("allow: writes a resolution doc with action='allow'", async () => {
    await POST(
      makeRequest({ action: "allow", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        reportId: REPORT_ID,
        opportunityId: OPP_ID,
        action: "allow",
        resolvedBy: "admin@example.com",
      })
    )
  })

  // ── remove action ───────────────────────────────────────────────────────────

  it("remove: deletes the opportunity document", async () => {
    await POST(
      makeRequest({ action: "remove", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(mockOppDoc).toHaveBeenCalledWith(OPP_ID)
    expect(mockDelete).toHaveBeenCalled()
  })

  it("remove: writes a resolution doc with action='remove'", async () => {
    await POST(
      makeRequest({ action: "remove", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ action: "remove", reportId: REPORT_ID })
    )
  })

  it("remove: returns 200 with success: true", async () => {
    const res = await POST(
      makeRequest({ action: "remove", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  // ── edit action ─────────────────────────────────────────────────────────────

  it("edit: updates the opportunity with the provided fields", async () => {
    const opportunityData = { title: "Updated Title", description: "New description" }
    await POST(
      makeRequest({ action: "edit", opportunityId: OPP_ID, opportunityData }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    expect(mockOppDoc).toHaveBeenCalledWith(OPP_ID)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated Title",
        description: "New description",
      })
    )
  })

  it("edit: appends updatedAt serverTimestamp to the update", async () => {
    await POST(
      makeRequest(
        { action: "edit", opportunityId: OPP_ID, opportunityData: { title: "New" } },
        ADMIN_TOKEN
      ),
      makeParams(REPORT_ID)
    )
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ updatedAt: { _methodName: "serverTimestamp" } })
    )
  })

  it("edit: writes a resolution doc with action='edit'", async () => {
    await POST(
      makeRequest(
        { action: "edit", opportunityId: OPP_ID, opportunityData: { title: "New" } },
        ADMIN_TOKEN
      ),
      makeParams(REPORT_ID)
    )
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ action: "edit", reportId: REPORT_ID })
    )
  })

  // ── Resolution writes to correct collection ──────────────────────────────────

  it("writes resolution to report_resolutions collection", async () => {
    await POST(
      makeRequest({ action: "allow", opportunityId: OPP_ID }, ADMIN_TOKEN),
      makeParams(REPORT_ID)
    )
    const collections = mockCollection.mock.calls.map(([name]: [string]) => name)
    expect(collections).toContain("report_resolutions")
  })

  it("stores the resolvedBy email from the decoded token", async () => {
    mockVerifyIdToken.mockResolvedValue({ email: "superadmin@org.com" })
    process.env.ADMIN_EMAILS = "superadmin@org.com"

    await POST(
      makeRequest({ action: "allow", opportunityId: OPP_ID }, makeJWT({ email: "superadmin@org.com" })),
      makeParams(REPORT_ID)
    )
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ resolvedBy: "superadmin@org.com" })
    )
  })
})
