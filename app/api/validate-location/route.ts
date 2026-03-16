import { NextRequest, NextResponse } from "next/server"

function sanitize(input: string, maxLen: number): string {
  return input.replace(/[\x00-\x1F\x7F]/g, "").slice(0, maxLen)
}

export async function POST(request: NextRequest) {
  let address: string

  try {
    const body = await request.json()
    address = sanitize(String(body.address ?? ""), 300)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!address.trim()) {
    return NextResponse.json({ valid: false, reason: "Address is required." })
  }

  try {
    const encoded = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=ca&addressdetails=1`

    const response = await Promise.race([
      fetch(url, {
        headers: { "User-Agent": "Voluntrack/1.0 (contact@voluntrack.ca)" },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Nominatim timeout")), 5000)
      ),
    ])

    const results = await response.json()

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({
        valid: false,
        reason: "Address could not be found. Please enter a valid Ontario address.",
      })
    }

    const lat = parseFloat(results[0].lat)
    const lng = parseFloat(results[0].lon)
    const displayName: string = results[0].display_name ?? address

    const state: string = results[0]?.address?.state ?? ""
    if (!state.toLowerCase().includes("ontario")) {
      return NextResponse.json({
        valid: false,
        reason: "Address must be located in Ontario, Canada.",
        lat,
        lng,
        displayName,
      })
    }

    return NextResponse.json({ valid: true, lat, lng, displayName })
  } catch (err) {
    console.error("[validate-location] Nominatim call failed:", err)
    return NextResponse.json({ valid: true })
  }
}
