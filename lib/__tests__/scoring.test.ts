import { scoreOpportunity, SCORE_WEIGHTS } from "@/lib/scoring"
import type { Opportunity } from "@/lib/firebase/opportunities"

jest.mock("@/lib/preferences", () => ({
  INTERESTS: [
    { id: "environment", label: "Environment" },
    { id: "education", label: "Education" },
    { id: "animals", label: "Animals" },
  ],
  CATEGORIES: ["Environment", "Education", "Animals", "Community Outreach"],
}))

function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    title: "Test Opportunity",
    organization: "Test Org",
    description: "A test description.",
    date: "Saturday, Jan 24, 2026",
    dateISO: "2026-01-24", // Saturday
    time: "10:00 AM",
    location: "123 Main St, Toronto, ON",
    hours: 3,
    spotsLeft: 20,   // > 10 → no urgency bonus
    totalSpots: 20,
    category: "Community Outreach",
    commitment: "One-time",
    skills: [],
    featured: false,
    image: "/icon.svg",
    ...overrides,
  }
}

describe("SCORE_WEIGHTS", () => {
  it("adds up to 100", () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBe(100)
  })
})

describe("scoreOpportunity", () => {
  describe("interest factor (+40)", () => {
    it("awards +40 when category matches a student interest", () => {
      const opp = makeOpp({ category: "Environment" })
      const withMatch = scoreOpportunity(opp, ["environment"], "no-preference", "any-time")
      const withoutMatch = scoreOpportunity(opp, [], "no-preference", "any-time")
      expect(withMatch - withoutMatch).toBe(SCORE_WEIGHTS.interest)
    })

    it("awards 0 when no interests match the category", () => {
      const opp = makeOpp({ category: "Community Outreach" })
      const withIrrelevantInterest = scoreOpportunity(opp, ["environment"], "no-preference", "any-time")
      const withNoInterests = scoreOpportunity(opp, [], "no-preference", "any-time")
      expect(withIrrelevantInterest).toBe(withNoInterests)
    })

    it("awards +40 for the first matching interest even if multiple are provided", () => {
      const opp = makeOpp({ category: "Education" })
      const score = scoreOpportunity(opp, ["environment", "education"], "no-preference", "any-time")
      const baseline = scoreOpportunity(opp, [], "no-preference", "any-time")
      expect(score - baseline).toBe(SCORE_WEIGHTS.interest)
    })
  })

  describe("format factor (+0-30)", () => {
    it("awards +30 when student prefers remote and location is remote", () => {
      const opp = makeOpp({ location: "Virtual - Online" })
      const score = scoreOpportunity(opp, [], "remote", "any-time")
      const baseline = scoreOpportunity(makeOpp({ location: "123 King St" }), [], "remote", "any-time")
      // remote pref + physical location = 0; remote pref + remote location = 30
      expect(score - baseline).toBe(SCORE_WEIGHTS.format)
    })

    it("awards +30 when student prefers in-person and location is physical", () => {
      const opp = makeOpp({ location: "123 King St W, Toronto" })
      const score = scoreOpportunity(opp, [], "in-person", "any-time")
      const baseline = scoreOpportunity(makeOpp({ location: "Remote" }), [], "in-person", "any-time")
      expect(score - baseline).toBe(SCORE_WEIGHTS.format)
    })

    it("awards 0 when student prefers remote but location is in-person", () => {
      const opp = makeOpp({ location: "123 Main St" })
      const score = scoreOpportunity(opp, [], "remote", "any-time")
      // remote pref, physical location → 0 format points
      // any-time → +10, no interests → 0, no urgency (spotsLeft=20) → 0
      expect(score).toBe(Math.round(SCORE_WEIGHTS.availability * 0.5))
    })

    it("awards +15 for no-preference format", () => {
      const opp = makeOpp({ location: "123 King St" })
      const score = scoreOpportunity(opp, [], "no-preference", "any-time")
      // no-preference: +15, any-time: +10, no interests: 0, no urgency: 0 → 25
      expect(score).toBe(Math.round(SCORE_WEIGHTS.format * 0.5) + Math.round(SCORE_WEIGHTS.availability * 0.5))
    })

    it("awards +20 for hybrid format preference", () => {
      const opp = makeOpp({ location: "123 King St" })
      const hybrid = scoreOpportunity(opp, [], "hybrid", "any-time")
      const noPreference = scoreOpportunity(opp, [], "no-preference", "any-time")
      expect(hybrid).toBeGreaterThan(noPreference)
      expect(hybrid - noPreference).toBe(Math.round(SCORE_WEIGHTS.format * 0.67) - Math.round(SCORE_WEIGHTS.format * 0.5))
    })

    it("detects 'virtual' as remote", () => {
      const opp = makeOpp({ location: "Virtual via Zoom" })
      const remoteScore = scoreOpportunity(opp, [], "remote", "any-time")
      const inPersonScore = scoreOpportunity(opp, [], "in-person", "any-time")
      expect(remoteScore).toBeGreaterThan(inPersonScore)
    })

    it("detects 'online' as remote", () => {
      const opp = makeOpp({ location: "Attend online" })
      const remoteScore = scoreOpportunity(opp, [], "remote", "any-time")
      const inPersonScore = scoreOpportunity(opp, [], "in-person", "any-time")
      expect(remoteScore).toBeGreaterThan(inPersonScore)
    })
  })

  describe("availability factor (+0-20)", () => {
    // 2026-01-24 is a Saturday (getDay() === 6)
    // 2026-01-26 is a Monday  (getDay() === 1)

    it("awards +20 when student prefers weekends and opportunity is on a Saturday", () => {
      const opp = makeOpp({ dateISO: "2026-01-24" })
      const weekends = scoreOpportunity(opp, [], "no-preference", "weekends")
      const anyTime = scoreOpportunity(opp, [], "no-preference", "any-time")
      expect(weekends - anyTime).toBe(SCORE_WEIGHTS.availability - Math.round(SCORE_WEIGHTS.availability * 0.5))
    })

    it("awards +20 when student prefers weekdays and opportunity is on a Monday", () => {
      const opp = makeOpp({ dateISO: "2026-01-26" })
      const weekdays = scoreOpportunity(opp, [], "no-preference", "weekdays")
      const anyTime = scoreOpportunity(opp, [], "no-preference", "any-time")
      expect(weekdays - anyTime).toBe(SCORE_WEIGHTS.availability - Math.round(SCORE_WEIGHTS.availability * 0.5))
    })

    it("awards 0 extra when student prefers weekdays but opportunity is on a Saturday", () => {
      const opp = makeOpp({ dateISO: "2026-01-24" }) // Saturday
      const weekdays = scoreOpportunity(opp, [], "no-preference", "weekdays")
      const anyTime = scoreOpportunity(opp, [], "no-preference", "any-time")
      // weekdays + weekend → 0 availability points vs any-time → +10
      expect(weekdays).toBeLessThan(anyTime)
      expect(anyTime - weekdays).toBe(Math.round(SCORE_WEIGHTS.availability * 0.5))
    })

    it("awards 0 extra when student prefers weekends but opportunity is on a Monday", () => {
      const opp = makeOpp({ dateISO: "2026-01-26" }) // Monday
      const weekends = scoreOpportunity(opp, [], "no-preference", "weekends")
      const anyTime = scoreOpportunity(opp, [], "no-preference", "any-time")
      expect(weekends).toBeLessThan(anyTime)
    })

    it("awards +10 neutral for any-time availability", () => {
      const opp = makeOpp()
      const score = scoreOpportunity(opp, [], "no-preference", "any-time")
      // format +15, availability +10, no urgency, no interest = 25
      expect(score).toBe(
        Math.round(SCORE_WEIGHTS.format * 0.5) + Math.round(SCORE_WEIGHTS.availability * 0.5)
      )
    })
  })

  describe("urgency factor (+0-10)", () => {
    it("awards +10 when spotsLeft is between 1 and 5", () => {
      const urgent = scoreOpportunity(makeOpp({ spotsLeft: 3 }), [], "no-preference", "any-time")
      const plenty = scoreOpportunity(makeOpp({ spotsLeft: 50 }), [], "no-preference", "any-time")
      expect(urgent - plenty).toBe(SCORE_WEIGHTS.urgency)
    })

    it("awards +5 when spotsLeft is between 6 and 10", () => {
      const semiUrgent = scoreOpportunity(makeOpp({ spotsLeft: 8 }), [], "no-preference", "any-time")
      const plenty = scoreOpportunity(makeOpp({ spotsLeft: 50 }), [], "no-preference", "any-time")
      expect(semiUrgent - plenty).toBe(Math.round(SCORE_WEIGHTS.urgency * 0.5))
    })

    it("awards +5 when spotsLeft is exactly 10", () => {
      const borderline = scoreOpportunity(makeOpp({ spotsLeft: 10 }), [], "no-preference", "any-time")
      const plenty = scoreOpportunity(makeOpp({ spotsLeft: 50 }), [], "no-preference", "any-time")
      expect(borderline - plenty).toBe(Math.round(SCORE_WEIGHTS.urgency * 0.5))
    })

    it("awards 0 when spotsLeft > 10", () => {
      const score = scoreOpportunity(makeOpp({ spotsLeft: 11 }), [], "no-preference", "any-time")
      const baseline = scoreOpportunity(makeOpp({ spotsLeft: 50 }), [], "no-preference", "any-time")
      expect(score).toBe(baseline)
    })
  })

  describe("perfect score", () => {
    it("returns 100 with a fully matching opportunity", () => {
      // Environment category + environment interest: +40
      // Remote location + remote preference: +30
      // Saturday + weekends preference: +20
      // spotsLeft=2 (1-5): +10
      const opp = makeOpp({
        category: "Environment",
        location: "Remote",
        dateISO: "2026-01-24", // Saturday
        spotsLeft: 2,
      })
      const score = scoreOpportunity(opp, ["environment"], "remote", "weekends")
      expect(score).toBe(100)
    })
  })

  describe("zero score", () => {
    it("returns 0 for mismatched preferences and no urgency", () => {
      // No matching interest, wrong format, wrong day, plenty of spots
      const opp = makeOpp({
        category: "Community Outreach",
        location: "123 King St, Toronto",  // in-person
        dateISO: "2026-01-24",              // Saturday
        spotsLeft: 50,
      })
      // remote pref → 0 format; weekdays pref → 0 availability; no interest match; no urgency
      const score = scoreOpportunity(opp, ["environment"], "remote", "weekdays")
      expect(score).toBe(0)
    })
  })
})
