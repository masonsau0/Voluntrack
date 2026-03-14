import { validateOpportunityContent } from "../opportunityValidation"

describe("validateOpportunityContent", () => {
  it("passes a valid eligible opportunity", () => {
    const result = validateOpportunityContent(
      "Food bank sorting volunteers needed for Saturday",
      "Come help sort and pack donations at Daily Bread Food Bank. No experience required. Great opportunity to give back to the community."
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("fails when description is too short", () => {
    const result = validateOpportunityContent(
      "Food bank sorting volunteers needed for Saturday",
      "Short desc."
    )
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Description must be at least 50 characters.")
  })

  it("fails when title is too short", () => {
    const result = validateOpportunityContent(
      "Short title",
      "This is a long enough description that explains the volunteer opportunity in sufficient detail for review."
    )
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Title must be at least 20 characters.")
  })

  it("fails when description contains babysitting", () => {
    const result = validateOpportunityContent(
      "Help needed at community centre this weekend",
      "We are looking for volunteers to assist with babysitting duties for children aged 3 to 10 during our weekend family program events."
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes("normally-paid work"))).toBe(true)
  })

  it("fails when title contains cut the grass", () => {
    const result = validateOpportunityContent(
      "Help us cut the grass at the park",
      "We need volunteers to come out and help cut the grass and trim the hedges around the entire community park grounds."
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes("normally-paid work"))).toBe(true)
  })

  it("fails when content contains court-ordered community service", () => {
    const result = validateOpportunityContent(
      "Court ordered community service hours available now",
      "This opportunity fulfills court-ordered community service requirements. Sign up today to complete your mandated service hours with our organization."
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes("court-ordered service"))).toBe(true)
  })

  it("fails when content mentions power tools", () => {
    const result = validateOpportunityContent(
      "Outdoor construction volunteer opportunity available",
      "Volunteers will operate power tools and chainsaws to help build new garden beds. Must be comfortable using heavy machinery and equipment."
    )
    expect(result.valid).toBe(false)
    expect(
      result.errors.some((e) =>
        e.includes("activities requiring vehicle operation or power tools")
      )
    ).toBe(true)
  })

  it("fails when content mentions driving required", () => {
    const result = validateOpportunityContent(
      "Meal delivery volunteer driver position open",
      "Driving required for this volunteer role. You will deliver meals to seniors across the city. Must have a valid license and your own vehicle available."
    )
    expect(result.valid).toBe(false)
    expect(
      result.errors.some((e) =>
        e.includes("activities requiring vehicle operation or power tools")
      )
    ).toBe(true)
  })
})
