/**
 * @jest-environment node
 */

import {
  hideOpportunity,
  getHiddenOpportunityIds,
} from "../hidden-opportunities"
import { collection, doc, setDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore"
import { db } from "../config"

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => "mock-timestamp"),
}))

jest.mock("../config", () => ({
  db: {},
}))

const mockCollection = collection as jest.Mock
const mockDoc = doc as jest.Mock
const mockSetDoc = setDoc as jest.Mock
const mockGetDocs = getDocs as jest.Mock
const mockQuery = query as jest.Mock
const mockWhere = where as jest.Mock

describe("hideOpportunity", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDoc.mockReturnValue("doc-ref")
    mockCollection.mockReturnValue("collection-ref")
    mockSetDoc.mockResolvedValue(undefined)
  })

  it("calls setDoc with compound doc ID {userId}_{opportunityId}", async () => {
    await hideOpportunity("user-1", "opp-abc")

    expect(mockDoc).toHaveBeenCalledWith(
      db,
      "user_hidden_opportunities",
      "user-1_opp-abc"
    )
    expect(mockSetDoc).toHaveBeenCalledWith("doc-ref", {
      userId: "user-1",
      opportunityId: "opp-abc",
      hiddenAt: "mock-timestamp",
    })
  })

  it("writes the correct userId and opportunityId fields", async () => {
    await hideOpportunity("student-xyz", "opportunity-999")

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "student-xyz",
        opportunityId: "opportunity-999",
      })
    )
  })

  it("uses serverTimestamp for hiddenAt", async () => {
    await hideOpportunity("user-1", "opp-1")

    expect(serverTimestamp).toHaveBeenCalled()
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ hiddenAt: "mock-timestamp" })
    )
  })

  it("propagates Firestore errors", async () => {
    mockSetDoc.mockRejectedValue(new Error("permission-denied"))

    await expect(hideOpportunity("user-1", "opp-1")).rejects.toThrow("permission-denied")
  })
})

describe("getHiddenOpportunityIds", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCollection.mockReturnValue("collection-ref")
    mockWhere.mockReturnValue("where-constraint")
    mockQuery.mockReturnValue("query-ref")
  })

  it("returns an empty Set when the user has no hidden opportunities", async () => {
    mockGetDocs.mockResolvedValue({ forEach: jest.fn() })

    const result = await getHiddenOpportunityIds("user-1")

    expect(result).toBeInstanceOf(Set)
    expect(result.size).toBe(0)
  })

  it("returns a Set containing all hidden opportunityIds for the user", async () => {
    mockGetDocs.mockResolvedValue({
      forEach: (cb: (doc: any) => void) => {
        cb({ data: () => ({ opportunityId: "opp-1" }) })
        cb({ data: () => ({ opportunityId: "opp-2" }) })
        cb({ data: () => ({ opportunityId: "opp-3" }) })
      },
    })

    const result = await getHiddenOpportunityIds("user-1")

    expect(result.size).toBe(3)
    expect(result.has("opp-1")).toBe(true)
    expect(result.has("opp-2")).toBe(true)
    expect(result.has("opp-3")).toBe(true)
  })

  it("queries user_hidden_opportunities filtered by userId", async () => {
    mockGetDocs.mockResolvedValue({ forEach: jest.fn() })

    await getHiddenOpportunityIds("student-abc")

    expect(mockCollection).toHaveBeenCalledWith(db, "user_hidden_opportunities")
    expect(mockWhere).toHaveBeenCalledWith("userId", "==", "student-abc")
    expect(mockQuery).toHaveBeenCalledWith("collection-ref", "where-constraint")
    expect(mockGetDocs).toHaveBeenCalledWith("query-ref")
  })

  it("propagates Firestore errors", async () => {
    mockGetDocs.mockRejectedValue(new Error("network-error"))

    await expect(getHiddenOpportunityIds("user-1")).rejects.toThrow("network-error")
  })
})
