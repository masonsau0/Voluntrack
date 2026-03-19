/**
 * Integration-style tests for the feed event side-effects in dashboard.ts.
 * Verifies that applyToOpportunity, updateApplicationStatus, and
 * submitExternalOpportunity correctly write to the feed_events collection.
 */

// ─── Firestore mock ──────────────────────────────────────────────────────────
const mockAddDoc = jest.fn().mockResolvedValue({ id: "new-doc-id" })
const mockSetDoc = jest.fn().mockResolvedValue(undefined)
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined)
const mockGetDoc = jest.fn()
const mockGetDocs = jest.fn()
const mockCollection = jest.fn((db: any, name: string) => `col:${name}`)
const mockDoc = jest.fn((_db: any, col: string, id: string) => `doc:${col}/${id}`)

jest.mock("firebase/firestore", () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  query: jest.fn().mockReturnValue("query-ref"),
  where: jest.fn().mockReturnValue("where-clause"),
  orderBy: jest.fn().mockReturnValue("orderby-clause"),
  limit: jest.fn().mockReturnValue("limit-clause"),
  serverTimestamp: jest.fn().mockReturnValue({ _type: "serverTimestamp" }),
  increment: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  Timestamp: {},
}))

jest.mock("@/lib/firebase/config", () => ({ db: {} }))

import {
  applyToOpportunity,
  updateApplicationStatus,
  submitExternalOpportunity,
} from "@/lib/firebase/dashboard"
import type { Opportunity } from "@/lib/firebase/opportunities"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    title: "Park Cleanup",
    organization: "City Parks",
    description: "Help clean up the park.",
    date: "Saturday, Jan 24, 2026",
    dateISO: "2026-01-24",
    time: "10:00 AM",
    location: "Trinity Bellwoods, Toronto",
    hours: 3,
    spotsLeft: 10,
    totalSpots: 20,
    category: "Environment",
    commitment: "One-time",
    skills: [],
    featured: false,
    image: "/icon.svg",
    ...overrides,
  }
}

/** Firestore doc snapshot where exists() === false */
function notFound() {
  return { exists: () => false, data: () => undefined }
}

/** Firestore doc snapshot where exists() === true */
function found(data: Record<string, any>) {
  return { exists: () => true, data: () => data }
}

/** Minimal getDocs snapshot (array of data objects) */
function docsSnapshot(rows: Record<string, any>[]) {
  return {
    docs: rows.map(d => ({ id: "doc-id", data: () => d })),
  }
}

beforeEach(() => jest.clearAllMocks())

// ─── applyToOpportunity ───────────────────────────────────────────────────────
describe("applyToOpportunity", () => {
  it("writes an 'application' feed event after setting the application to pending", async () => {
    mockGetDoc.mockResolvedValueOnce(notFound())        // appRef – not yet applied
    mockGetDocs.mockResolvedValueOnce(docsSnapshot([])) // badge count query

    await applyToOpportunity("user-1", makeOpportunity())

    const feedEventCall = mockAddDoc.mock.calls.find(
      ([col]) => col === "col:feed_events"
    )
    expect(feedEventCall).toBeDefined()
    expect(feedEventCall![1]).toMatchObject({
      type: "application",
      opportunityTitle: "Park Cleanup",
      opportunityId: "opp-1",
    })
  })

  it("includes a createdAt timestamp in the feed event", async () => {
    mockGetDoc.mockResolvedValueOnce(notFound())
    mockGetDocs.mockResolvedValueOnce(docsSnapshot([]))

    await applyToOpportunity("user-1", makeOpportunity())

    const feedEventCall = mockAddDoc.mock.calls.find(([col]) => col === "col:feed_events")
    expect(feedEventCall![1]).toHaveProperty("createdAt")
  })

  it("still persists the application even if the feed event write fails", async () => {
    mockGetDoc.mockResolvedValueOnce(notFound())
    mockGetDocs.mockResolvedValueOnce(docsSnapshot([]))
    // Make addDoc (feed_events write) throw on first call
    mockAddDoc.mockRejectedValueOnce(new Error("Firestore write error"))

    // Should not throw – writeFeedEvent swallows errors
    await expect(applyToOpportunity("user-1", makeOpportunity())).resolves.toBeUndefined()
    expect(mockSetDoc).toHaveBeenCalled()
  })

  it("throws when the user has already applied (non-saved)", async () => {
    mockGetDoc.mockResolvedValueOnce(found({ status: "pending" }))
    await expect(applyToOpportunity("user-1", makeOpportunity())).rejects.toThrow(
      "You have already applied to this opportunity."
    )
    // No feed event should be written
    expect(mockAddDoc).not.toHaveBeenCalledWith("col:feed_events", expect.anything())
  })
})

// ─── updateApplicationStatus → completion ────────────────────────────────────
describe("updateApplicationStatus (completion)", () => {
  it("writes a 'completion' feed event when status becomes completed", async () => {
    // First getDoc: the application doc
    mockGetDoc
      .mockResolvedValueOnce(found({
        status: "approved",
        title: "Park Cleanup",
        opportunityId: "opp-1",
        hours: 3,
      }))
      // Second getDoc: the student profile
      .mockResolvedValueOnce(found({
        hoursCompleted: 37, // just below goal-setter (40)
        badges: ["first-steps", "helping-hand"],
      }))

    await updateApplicationStatus("user-1", "opp-1", "completed")

    const feedEventCalls = mockAddDoc.mock.calls.filter(([col]) => col === "col:feed_events")
    const completionEvent = feedEventCalls.find(([, data]) => data.type === "completion")
    expect(completionEvent).toBeDefined()
    expect(completionEvent![1]).toMatchObject({
      type: "completion",
      opportunityTitle: "Park Cleanup",
      opportunityId: "opp-1",
    })
  })

  it("writes a 'badge_earned' feed event when a new badge milestone is crossed", async () => {
    // Current hours=37, adding 3 → 40 total → earns 'goal-setter' badge
    mockGetDoc
      .mockResolvedValueOnce(found({
        status: "approved",
        title: "Park Cleanup",
        opportunityId: "opp-1",
        hours: 3,
      }))
      .mockResolvedValueOnce(found({
        hoursCompleted: 37,
        badges: ["first-steps", "helping-hand"],
      }))

    await updateApplicationStatus("user-1", "opp-1", "completed")

    const feedEventCalls = mockAddDoc.mock.calls.filter(([col]) => col === "col:feed_events")
    const badgeEvent = feedEventCalls.find(([, data]) => data.type === "badge_earned")
    expect(badgeEvent).toBeDefined()
    expect(badgeEvent![1]).toMatchObject({
      type: "badge_earned",
      badgeId: "goal-setter",
      badgeName: "Goal Setter",
      opportunityTitle: "Park Cleanup",
    })
  })

  it("writes one badge_earned event per newly earned badge", async () => {
    // First time completing anything: hours go from 0 → 11
    // Earns both 'first-steps' (1 hr) and 'helping-hand' (10 hrs)
    mockGetDoc
      .mockResolvedValueOnce(found({
        status: "approved",
        title: "Food Bank",
        opportunityId: "opp-2",
        hours: 11,
      }))
      .mockResolvedValueOnce(found({
        hoursCompleted: 0,
        badges: [],
      }))

    await updateApplicationStatus("user-1", "opp-2", "completed")

    const feedEventCalls = mockAddDoc.mock.calls.filter(([col]) => col === "col:feed_events")
    const badgeEvents = feedEventCalls.filter(([, data]) => data.type === "badge_earned")
    expect(badgeEvents).toHaveLength(2)
    const badgeIds = badgeEvents.map(([, data]) => data.badgeId)
    expect(badgeIds).toContain("first-steps")
    expect(badgeIds).toContain("helping-hand")
  })

  it("does not write a badge_earned event when no new badges are earned", async () => {
    // Student already has all badges, adding more hours
    mockGetDoc
      .mockResolvedValueOnce(found({
        status: "approved",
        title: "Park Cleanup",
        opportunityId: "opp-1",
        hours: 2,
      }))
      .mockResolvedValueOnce(found({
        hoursCompleted: 100,
        badges: ["first-steps", "helping-hand", "goal-setter"],
      }))

    await updateApplicationStatus("user-1", "opp-1", "completed")

    const badgeEvents = mockAddDoc.mock.calls.filter(([col, data]) =>
      col === "col:feed_events" && data.type === "badge_earned"
    )
    expect(badgeEvents).toHaveLength(0)
  })

  it("does not write a completion event when status is approved (not completed)", async () => {
    mockGetDoc.mockResolvedValueOnce(found({
      status: "pending",
      title: "Park Cleanup",
      opportunityId: "opp-1",
      hours: 3,
    }))

    await updateApplicationStatus("user-1", "opp-1", "approved")

    const completionEvents = mockAddDoc.mock.calls.filter(
      ([col, data]) => col === "col:feed_events" && data.type === "completion"
    )
    expect(completionEvents).toHaveLength(0)
  })

  it("does not write a duplicate completion event if already completed", async () => {
    mockGetDoc.mockResolvedValueOnce(found({
      status: "completed", // already completed
      title: "Park Cleanup",
      opportunityId: "opp-1",
      hours: 3,
    }))

    await updateApplicationStatus("user-1", "opp-1", "completed")

    const feedEventCalls = mockAddDoc.mock.calls.filter(([col]) => col === "col:feed_events")
    expect(feedEventCalls).toHaveLength(0)
  })
})

// ─── submitExternalOpportunity ────────────────────────────────────────────────
describe("submitExternalOpportunity", () => {
  const baseData = {
    title: "Community Garden",
    organization: "Green Thumbs",
    date: "2026-02-15",
    hours: 2,
    category: "Environment",
    reflection: "I learned about composting.",
    contactName: "Jane Doe",
    contactEmail: "jane@example.com",
  }

  it("writes a 'completion' feed event for external opportunities", async () => {
    mockGetDoc.mockResolvedValueOnce(found({ hoursCompleted: 5, badges: ["first-steps"] }))

    await submitExternalOpportunity("user-1", baseData)

    const completionEvent = mockAddDoc.mock.calls.find(
      ([col, data]) => col === "col:feed_events" && data.type === "completion"
    )
    expect(completionEvent).toBeDefined()
    expect(completionEvent![1]).toMatchObject({
      type: "completion",
      opportunityTitle: "Community Garden",
    })
  })

  it("writes a 'badge_earned' event when external hours cross a milestone", async () => {
    // 5 + 5 = 10 → earns 'helping-hand'
    mockGetDoc.mockResolvedValueOnce(found({ hoursCompleted: 5, badges: ["first-steps"] }))

    await submitExternalOpportunity("user-1", { ...baseData, hours: 5 })

    const badgeEvent = mockAddDoc.mock.calls.find(
      ([col, data]) => col === "col:feed_events" && data.type === "badge_earned"
    )
    expect(badgeEvent).toBeDefined()
    expect(badgeEvent![1]).toMatchObject({
      type: "badge_earned",
      badgeId: "helping-hand",
      badgeName: "Helping Hand",
    })
  })

  it("saves lat, lng, and location when provided", async () => {
    mockGetDoc.mockResolvedValueOnce(found({ hoursCompleted: 5, badges: ["first-steps"] }))

    await submitExternalOpportunity("user-1", {
      ...baseData,
      location: "123 Main St, Toronto, ON",
      lat: 43.6532,
      lng: -79.3832,
    })

    const appWriteCall = mockSetDoc.mock.calls[0]
    expect(appWriteCall[1]).toMatchObject({
      location: "123 Main St, Toronto, ON",
      lat: 43.6532,
      lng: -79.3832,
    })
  })

  it("defaults location to 'External' when none is provided", async () => {
    mockGetDoc.mockResolvedValueOnce(found({ hoursCompleted: 5, badges: ["first-steps"] }))

    await submitExternalOpportunity("user-1", baseData)

    const appWriteCall = mockSetDoc.mock.calls[0]
    expect(appWriteCall[1].location).toBe("External")
  })

  it("does not add lat/lng fields when not provided", async () => {
    mockGetDoc.mockResolvedValueOnce(found({ hoursCompleted: 5, badges: ["first-steps"] }))

    await submitExternalOpportunity("user-1", baseData)

    const appWriteCall = mockSetDoc.mock.calls[0]
    expect(appWriteCall[1]).not.toHaveProperty("lat")
    expect(appWriteCall[1]).not.toHaveProperty("lng")
  })

  it("marks the application as completed automatically", async () => {
    mockGetDoc.mockResolvedValueOnce(found({ hoursCompleted: 0, badges: [] }))

    await submitExternalOpportunity("user-1", baseData)

    const appWriteCall = mockSetDoc.mock.calls[0]
    expect(appWriteCall[1].status).toBe("completed")
    expect(appWriteCall[1].isExternal).toBe(true)
  })
})
