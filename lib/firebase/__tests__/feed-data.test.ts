import type { Opportunity } from "@/lib/firebase/opportunities"

// ─── Firestore mock ──────────────────────────────────────────────────────────
jest.mock("firebase/firestore", () => ({
  collection: jest.fn((_db: any, name: string) => `col:${name}`),
  getDocs: jest.fn(),
  query: jest.fn().mockReturnValue("query-ref"),
  where: jest.fn().mockReturnValue("where-clause"),
  orderBy: jest.fn().mockReturnValue("orderby-clause"),
  limit: jest.fn().mockReturnValue("limit-clause"),
  serverTimestamp: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  increment: jest.fn(),
  Timestamp: {},
}))

// Grab references after mock is established
const firestoreMock = jest.requireMock("firebase/firestore") as Record<string, jest.Mock>
const mockGetDocs: jest.Mock = firestoreMock.getDocs
const mockCollection: jest.Mock = firestoreMock.collection
const mockWhere: jest.Mock = firestoreMock.where

jest.mock("@/lib/firebase/config", () => ({ db: {} }))

// ─── getAllOpportunities mock ─────────────────────────────────────────────────
const mockGetAllOpportunities = jest.fn()
jest.mock("@/lib/firebase/opportunities", () => ({
  getAllOpportunities: (...args: any[]) => mockGetAllOpportunities(...args),
}))

import { getOpportunitiesForMap, getOrgCompletedCounts, getFeedEvents } from "@/lib/firebase/feed"

function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    title: "Test Opp",
    organization: "Test Org",
    description: "Desc",
    date: "Jan 24, 2026",
    dateISO: "2026-01-24",
    time: "10:00 AM",
    location: "Toronto",
    hours: 3,
    spotsLeft: 10,
    totalSpots: 10,
    category: "Community Outreach",
    commitment: "One-time",
    skills: [],
    featured: false,
    image: "/icon.svg",
    ...overrides,
  }
}

beforeEach(() => jest.clearAllMocks())

// ─── getOpportunitiesForMap ───────────────────────────────────────────────────
describe("getOpportunitiesForMap", () => {
  it("returns only opportunities that have both lat and lng", async () => {
    mockGetAllOpportunities.mockResolvedValueOnce([
      makeOpp({ id: "a", lat: 43.6, lng: -79.3 }),
      makeOpp({ id: "b" }),                          // no lat/lng
      makeOpp({ id: "c", lat: 43.7, lng: -79.4 }),
      makeOpp({ id: "d", lat: 43.8 }),               // lat only
    ])
    const result = await getOpportunitiesForMap()
    expect(result.map(o => o.id)).toEqual(["a", "c"])
  })

  it("returns an empty array when no opportunities have coordinates", async () => {
    mockGetAllOpportunities.mockResolvedValueOnce([
      makeOpp({ id: "a" }),
      makeOpp({ id: "b" }),
    ])
    const result = await getOpportunitiesForMap()
    expect(result).toHaveLength(0)
  })

  it("returns all opportunities when all have coordinates", async () => {
    mockGetAllOpportunities.mockResolvedValueOnce([
      makeOpp({ id: "a", lat: 43.6, lng: -79.3 }),
      makeOpp({ id: "b", lat: 43.7, lng: -79.4 }),
    ])
    const result = await getOpportunitiesForMap()
    expect(result).toHaveLength(2)
  })

  it("preserves all fields of the returned opportunities", async () => {
    const opp = makeOpp({ id: "a", lat: 43.6, lng: -79.3, title: "Park Cleanup" })
    mockGetAllOpportunities.mockResolvedValueOnce([opp])
    const result = await getOpportunitiesForMap()
    expect(result[0]).toMatchObject({ id: "a", lat: 43.6, lng: -79.3, title: "Park Cleanup" })
  })
})

// ─── getOrgCompletedCounts ────────────────────────────────────────────────────
describe("getOrgCompletedCounts", () => {
  it("counts completed applications grouped by organization", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { data: () => ({ organization: "Org A" }) },
        { data: () => ({ organization: "Org A" }) },
        { data: () => ({ organization: "Org B" }) },
      ],
    })
    const counts = await getOrgCompletedCounts()
    expect(counts).toEqual({ "Org A": 2, "Org B": 1 })
  })

  it("returns an empty object when there are no completed applications", async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] })
    const counts = await getOrgCompletedCounts()
    expect(counts).toEqual({})
  })

  it("queries user_applications filtered by status=completed", async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] })
    await getOrgCompletedCounts()
    expect(mockWhere).toHaveBeenCalledWith("status", "==", "completed")
    expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "user_applications")
  })

  it("skips documents with no organization field", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { data: () => ({ organization: "Org A" }) },
        { data: () => ({}) }, // no organization
      ],
    })
    const counts = await getOrgCompletedCounts()
    expect(counts).toEqual({ "Org A": 1 })
  })

  it("returns empty object and does not throw on Firestore error", async () => {
    mockGetDocs.mockRejectedValueOnce(new Error("Firestore error"))
    const counts = await getOrgCompletedCounts()
    expect(counts).toEqual({})
  })
})

// ─── getFeedEvents ────────────────────────────────────────────────────────────
describe("getFeedEvents", () => {
  it("returns feed events mapped from Firestore documents", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "e1",
          data: () => ({
            type: "application",
            opportunityTitle: "Park Cleanup",
            createdAt: { seconds: 1000, nanoseconds: 0 },
          }),
        },
        {
          id: "e2",
          data: () => ({
            type: "completion",
            opportunityTitle: "Food Bank",
            createdAt: { seconds: 900, nanoseconds: 0 },
          }),
        },
      ],
    })
    const events = await getFeedEvents(10)
    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({ id: "e1", type: "application", opportunityTitle: "Park Cleanup" })
    expect(events[1]).toMatchObject({ id: "e2", type: "completion", opportunityTitle: "Food Bank" })
  })

  it("queries feed_events collection ordered by createdAt desc with limit", async () => {
    const { orderBy, limit } = jest.requireMock("firebase/firestore")
    mockGetDocs.mockResolvedValueOnce({ docs: [] })

    await getFeedEvents(15)

    expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "feed_events")
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc")
    expect(limit).toHaveBeenCalledWith(15)
  })

  it("returns an empty array when there are no events", async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] })
    const events = await getFeedEvents(10)
    expect(events).toEqual([])
  })

  it("includes optional badge fields when present", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "e1",
          data: () => ({
            type: "badge_earned",
            opportunityTitle: "Park Cleanup",
            badgeId: "first-steps",
            badgeName: "First Steps",
            createdAt: { seconds: 1000, nanoseconds: 0 },
          }),
        },
      ],
    })
    const events = await getFeedEvents(5)
    expect(events[0]).toMatchObject({
      type: "badge_earned",
      badgeId: "first-steps",
      badgeName: "First Steps",
    })
  })

  it("returns empty array and does not throw on Firestore error", async () => {
    mockGetDocs.mockRejectedValueOnce(new Error("Firestore error"))
    const events = await getFeedEvents(10)
    expect(events).toEqual([])
  })
})
