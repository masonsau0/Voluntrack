/**
 * @jest-environment node
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../config"

jest.mock("../config", () => ({ db: {} }))

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "mock-timestamp"),
  // stub other exports used by org.ts imports (getDocs, etc.) to avoid import errors
  doc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}))

// Mock auth dependency used in getOrgApplicants (not under test here)
jest.mock("../auth", () => ({ getUserProfile: jest.fn() }))

import { createOpportunity } from "../org"

const mockCollection = collection as jest.Mock
const mockAddDoc = addDoc as jest.Mock

const validOpp = {
  title: "Food Bank Sorting",
  organization: "Test Org",
  description: "Help sort donations.",
  date: "Saturday, July 5, 2025",
  dateISO: "2025-07-05",
  time: "09:00 - 12:00",
  location: "123 King St W, Toronto, ON",
  hours: 3,
  spotsLeft: 20,
  totalSpots: 20,
  category: "Community Outreach",
  commitment: "One-time",
  skills: [],
  featured: false,
  image: "/test.png",
}

describe("createOpportunity", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCollection.mockReturnValue("collection-ref")
  })

  it("returns the new opportunity document ID on success", async () => {
    mockAddDoc.mockResolvedValue({ id: "new-opp-123" })

    const id = await createOpportunity("org-uid", validOpp)

    expect(id).toBe("new-opp-123")
  })

  it("writes orgId and serverTimestamp fields to Firestore", async () => {
    mockAddDoc.mockResolvedValue({ id: "new-opp-123" })

    await createOpportunity("org-uid", validOpp)

    expect(mockAddDoc).toHaveBeenCalledWith(
      "collection-ref",
      expect.objectContaining({
        orgId: "org-uid",
        createdAt: "mock-timestamp",
        updatedAt: "mock-timestamp",
      })
    )
  })

  it("calls collection with 'opportunities'", async () => {
    mockAddDoc.mockResolvedValue({ id: "x" })

    await createOpportunity("org-uid", validOpp)

    expect(mockCollection).toHaveBeenCalledWith(db, "opportunities")
  })

  it("throws 'Failed to create opportunity.' when Firestore returns permission-denied", async () => {
    mockAddDoc.mockRejectedValue(
      Object.assign(new Error("Missing or insufficient permissions."), { code: "permission-denied" })
    )

    await expect(createOpportunity("org-uid", validOpp)).rejects.toThrow(
      "Failed to create opportunity."
    )
  })

  it("throws 'Failed to create opportunity.' when Firestore is unavailable", async () => {
    mockAddDoc.mockRejectedValue(
      Object.assign(new Error("Service unavailable"), { code: "unavailable" })
    )

    await expect(createOpportunity("org-uid", validOpp)).rejects.toThrow(
      "Failed to create opportunity."
    )
  })

  it("throws 'Failed to create opportunity.' when quota is exceeded", async () => {
    mockAddDoc.mockRejectedValue(
      Object.assign(new Error("Quota exceeded"), { code: "resource-exhausted" })
    )

    await expect(createOpportunity("org-uid", validOpp)).rejects.toThrow(
      "Failed to create opportunity."
    )
  })
})
