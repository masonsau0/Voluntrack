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

const ontarioResult = {
  lat: "43.6532",
  lon: "-79.3832",
  display_name: "123 King St W, Toronto, Ontario, Canada",
  address: { state: "Ontario", country: "Canada" },
}

const bcResult = {
  lat: "49.2827",
  lon: "-123.1207",
  display_name: "123 Main St, Vancouver, British Columbia, Canada",
  address: { state: "British Columbia", country: "Canada" },
}

describe("POST /api/validate-location", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns valid: true for an Ontario address", async () => {
    mockFetch.mockReturnValue(makeNominatimResponse([ontarioResult]))

    const res = await POST(makeRequest({ address: "123 King St W, Toronto, ON" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
  })

  it("returns lat, lng, and displayName for a valid Ontario address", async () => {
    mockFetch.mockReturnValue(makeNominatimResponse([ontarioResult]))

    const res = await POST(makeRequest({ address: "123 King St W, Toronto, ON" }))
    const body = await res.json()

    expect(body.lat).toBeCloseTo(43.6532)
    expect(body.lng).toBeCloseTo(-79.3832)
    expect(body.displayName).toBe("123 King St W, Toronto, Ontario, Canada")
  })

  it("returns valid: false for a non-Ontario Canadian address", async () => {
    mockFetch.mockReturnValue(makeNominatimResponse([bcResult]))

    const res = await POST(makeRequest({ address: "123 Main St, Vancouver, BC" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(false)
    expect(body.reason).toMatch(/Ontario/i)
  })

  it("returns lat, lng, and displayName even for non-Ontario addresses (so map can show with warning)", async () => {
    mockFetch.mockReturnValue(makeNominatimResponse([bcResult]))

    const res = await POST(makeRequest({ address: "123 Main St, Vancouver, BC" }))
    const body = await res.json()

    expect(body.lat).toBeCloseTo(49.2827)
    expect(body.lng).toBeCloseTo(-123.1207)
    expect(body.displayName).toBe("123 Main St, Vancouver, British Columbia, Canada")
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
        { lat: "43.6532", lon: "-79.3832", display_name: "456 Queen St, Toronto, ontario, Canada", address: { state: "ontario", country: "Canada" } },
      ])
    )

    const res = await POST(makeRequest({ address: "456 Queen St, Toronto, ON" }))
    const body = await res.json()

    expect(body.valid).toBe(true)
  })

  it("returns no lat/lng when Nominatim returns empty results", async () => {
    mockFetch.mockReturnValue(makeNominatimResponse([]))

    const res = await POST(makeRequest({ address: "zzz not a real place xyz" }))
    const body = await res.json()

    expect(body.lat).toBeUndefined()
    expect(body.lng).toBeUndefined()
  })
})
