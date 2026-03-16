/**
 * @jest-environment node
 */

import { POST } from "../route"

const mockFetch = jest.fn()
global.fetch = mockFetch

function makeRequest(body: object | string) {
  const isValid = typeof body === "object"
  return {
    json: isValid
      ? jest.fn().mockResolvedValue(body)
      : jest.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
  } as any
}

function makeNominatimResponse(results: object[]) {
  return Promise.resolve({
    json: jest.fn().mockResolvedValue(results),
  })
}

describe("POST /api/validate-location", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns valid: true for an Ontario address", async () => {
    mockFetch.mockReturnValue(
      makeNominatimResponse([
        { address: { state: "Ontario", country: "Canada" }, display_name: "123 King St W, Toronto, Ontario, Canada" },
      ])
    )

    const res = await POST(makeRequest({ address: "123 King St W, Toronto, ON" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
  })

  it("returns valid: false for a non-Ontario Canadian address", async () => {
    mockFetch.mockReturnValue(
      makeNominatimResponse([
        { address: { state: "British Columbia", country: "Canada" }, display_name: "123 Main St, Vancouver, British Columbia, Canada" },
      ])
    )

    const res = await POST(makeRequest({ address: "123 Main St, Vancouver, BC" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(false)
    expect(body.reason).toMatch(/Ontario/i)
  })

  it("returns valid: false when Nominatim returns empty results", async () => {
    mockFetch.mockReturnValue(makeNominatimResponse([]))

    const res = await POST(makeRequest({ address: "zzz not a real place xyz" }))
    const body = await res.json()

    expect(body.valid).toBe(false)
  })

  it("fails open (valid: true) when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))

    const res = await POST(makeRequest({ address: "123 King St W, Toronto, ON" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
  })

  it("returns 400 for malformed request body", async () => {
    const res = await POST(makeRequest("not-json"))
    expect(res.status).toBe(400)
  })

  it("returns valid: false for empty address", async () => {
    const res = await POST(makeRequest({ address: "" }))
    const body = await res.json()

    expect(body.valid).toBe(false)
  })

  it("matches state field case-insensitively (lowercase 'ontario')", async () => {
    mockFetch.mockReturnValue(
      makeNominatimResponse([
        { address: { state: "ontario", country: "Canada" }, display_name: "456 Queen St, Toronto, ontario, Canada" },
      ])
    )

    const res = await POST(makeRequest({ address: "456 Queen St, Toronto, ON" }))
    const body = await res.json()

    expect(body.valid).toBe(true)
  })
})
