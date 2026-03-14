/**
 * @jest-environment node
 */

import { POST } from "../route"

// Mock @google/genai
const mockGenerateContent = jest.fn()
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}))

function makeRequest(body: object | string) {
  const isValid = typeof body === "object"
  return {
    json: isValid
      ? jest.fn().mockResolvedValue(body)
      : jest.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
  } as any
}

describe("POST /api/validate-opportunity", () => {
  const originalEnv = process.env.GEMINI_API_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GEMINI_API_KEY = "test-key"
  })

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.GEMINI_API_KEY
    } else {
      process.env.GEMINI_API_KEY = originalEnv
    }
  })

  it("returns valid: true for an eligible opportunity", async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"valid": true, "reason": ""}',
    })

    const res = await POST(makeRequest({
      title: "Food bank sorting volunteers needed",
      description: "Help sort donations at the food bank on Saturday morning.",
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
  })

  it("returns valid: false with reason when Gemini says ineligible", async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"valid": false, "reason": "Babysitting is a normally-paid activity and not eligible for community service."}',
    })

    const res = await POST(makeRequest({
      title: "Babysitting volunteer opportunity",
      description: "We need someone to babysit children while parents attend meetings.",
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(false)
    expect(body.reason).toContain("Babysitting")
  })

  it("fails open (valid: true) when Gemini throws an error", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Network error"))

    const res = await POST(makeRequest({
      title: "Community garden volunteer opportunity",
      description: "Help maintain the community garden every Saturday morning.",
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
  })

  it("fails open when GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY

    const res = await POST(makeRequest({
      title: "Food bank sorting volunteers needed",
      description: "Help sort donations at the food bank on Saturday morning.",
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
  })

  it("returns 400 for malformed request body", async () => {
    const res = await POST(makeRequest("not-json"))
    expect(res.status).toBe(400)
  })

  it("strips markdown code fences from Gemini response", async () => {
    mockGenerateContent.mockResolvedValue({
      text: '```json\n{"valid": true, "reason": ""}\n```',
    })

    const res = await POST(makeRequest({
      title: "Tutoring students at the local school",
      description: "Volunteer to tutor elementary school students in math and reading.",
    }))
    const body = await res.json()

    expect(body.valid).toBe(true)
  })
})
