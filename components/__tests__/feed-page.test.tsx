import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import type { Opportunity } from "@/lib/firebase/opportunities"
import type { FeedEvent } from "@/lib/firebase/dashboard"

// ─── Next.js dynamic → render stub map ───────────────────────────────────────
jest.mock("next/dynamic", () => (_factory: any) => {
  return function MockMap() {
    return <div data-testid="community-map" />
  }
})

// ─── Google Maps (imported at top-level by feed page) ────────────────────────
jest.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ children }: any) => <div data-testid="google-map">{children}</div>,
  Marker: () => <div data-testid="map-marker" />,
  InfoWindow: ({ children }: any) => <div data-testid="info-window">{children}</div>,
  useJsApiLoader: jest.fn().mockReturnValue({ isLoaded: true }),
}))

// ─── Data layer mocks ─────────────────────────────────────────────────────────
const mockGetAllOpportunities = jest.fn()
const mockGetOpportunitiesForMap = jest.fn()
const mockGetOrgCompletedCounts = jest.fn()
const mockGetFeedEvents = jest.fn()
const mockGetStudentProfile = jest.fn()

jest.mock("@/lib/firebase/opportunities", () => ({
  getAllOpportunities: (...args: any[]) => mockGetAllOpportunities(...args),
}))

jest.mock("@/lib/firebase/feed", () => ({
  getOpportunitiesForMap: (...args: any[]) => mockGetOpportunitiesForMap(...args),
  getOrgCompletedCounts: (...args: any[]) => mockGetOrgCompletedCounts(...args),
  getFeedEvents: (...args: any[]) => mockGetFeedEvents(...args),
}))

jest.mock("@/lib/firebase/student-profiles", () => ({
  getStudentProfile: (...args: any[]) => mockGetStudentProfile(...args),
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ userProfile: { uid: "user-1" } }),
}))

jest.mock("@/components/navigation", () => ({
  Navigation: () => <nav data-testid="nav" />,
}))

jest.mock("@/lib/preferences", () => ({
  INTERESTS: [
    { id: "environment", label: "Environment" },
    { id: "education", label: "Education" },
  ],
  CATEGORIES: ["Environment", "Education", "Community Outreach"],
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    title: "Park Cleanup",
    organization: "City Parks",
    description: "Help clean the park.",
    date: "Sat, Jan 24, 2026",
    dateISO: "2026-01-24",
    time: "10:00 AM",
    location: "Toronto, ON",
    hours: 3,
    spotsLeft: 10,
    totalSpots: 20,
    category: "Environment",
    commitment: "One-time",
    skills: [],
    featured: true,
    image: "/icon.svg",
    lat: 43.6532,
    lng: -79.3832,
    ...overrides,
  }
}

function makeTimestamp(date = new Date("2026-03-01T12:00:00Z")) {
  return { toDate: () => date, seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }
}

function makeEvent(overrides: Partial<FeedEvent> = {}): FeedEvent {
  return {
    id: "event-1",
    type: "application",
    opportunityTitle: "Park Cleanup",
    opportunityId: "opp-1",
    createdAt: makeTimestamp() as any,
    ...overrides,
  }
}

function setupDefaultMocks() {
  mockGetOpportunitiesForMap.mockResolvedValue([makeOpp()])
  mockGetAllOpportunities.mockResolvedValue([makeOpp()])
  mockGetOrgCompletedCounts.mockResolvedValue({ "City Parks": 5 })
  mockGetFeedEvents.mockResolvedValue([])
  mockGetStudentProfile.mockResolvedValue({
    interests: ["environment"],
    volunteerFormat: "in-person",
    availability: "weekends",
  })
}

// Import after all mocks are set up
import FeedPage from "@/app/feed/page"

beforeEach(() => {
  jest.clearAllMocks()
  setupDefaultMocks()
})

async function renderFeedPage() {
  let result: ReturnType<typeof render>
  await act(async () => {
    result = render(<FeedPage />)
  })
  return result!
}

// ─── Section headings ─────────────────────────────────────────────────────────
describe("FeedPage section headings", () => {
  it("renders the page title", async () => {
    await renderFeedPage()
    expect(screen.getByText("Feed")).toBeInTheDocument()
  })

  it("renders the Community Map section", async () => {
    await renderFeedPage()
    expect(screen.getByText("Community Map")).toBeInTheDocument()
  })

  it("renders the Accomplishments section", async () => {
    await renderFeedPage()
    expect(screen.getByText("Accomplishments")).toBeInTheDocument()
  })

  it("renders the Activity section", async () => {
    await renderFeedPage()
    expect(screen.getByText("Activity")).toBeInTheDocument()
  })

  it("renders the Featured Opportunities section", async () => {
    await renderFeedPage()
    expect(screen.getByText("Featured Opportunities")).toBeInTheDocument()
  })
})

// ─── Accomplishments ──────────────────────────────────────────────────────────
describe("FeedPage Accomplishments", () => {
  it("shows 'No accomplishments yet' when there are no badge_earned events", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ type: "application" }),
      makeEvent({ type: "completion" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText("No accomplishments yet.")).toBeInTheDocument()
    })
  })

  it("displays badge_earned events with badge name and opportunity title", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({
        id: "b1",
        type: "badge_earned",
        badgeName: "Goal Setter",
        opportunityTitle: "Food Bank Shift",
      }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/Goal Setter/)).toBeInTheDocument()
      expect(screen.getByText(/Food Bank Shift/)).toBeInTheDocument()
    })
  })

  it("shows multiple badge_earned events", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ id: "b1", type: "badge_earned", badgeName: "First Steps", opportunityTitle: "Park Cleanup" }),
      makeEvent({ id: "b2", type: "badge_earned", badgeName: "Helping Hand", opportunityTitle: "Food Bank" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/First Steps/)).toBeInTheDocument()
      expect(screen.getByText(/Helping Hand/)).toBeInTheDocument()
    })
  })

  it("falls back to badgeId when badgeName is missing", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ id: "b1", type: "badge_earned", badgeId: "goal-setter", badgeName: undefined, opportunityTitle: "Park Cleanup" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/goal-setter/)).toBeInTheDocument()
    })
  })
})

// ─── Activity ─────────────────────────────────────────────────────────────────
describe("FeedPage Activity", () => {
  it("shows 'No activity yet' when there are no application or completion events", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ type: "badge_earned", badgeName: "First Steps" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText("No activity yet.")).toBeInTheDocument()
    })
  })

  it("displays 'A student applied to X' for application events", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ type: "application", opportunityTitle: "Library Tutoring" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/A student applied to/)).toBeInTheDocument()
      expect(screen.getByText(/Library Tutoring/)).toBeInTheDocument()
    })
  })

  it("displays 'A student just completed X' for completion events", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ type: "completion", opportunityTitle: "Beach Cleanup" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/A student just completed/)).toBeInTheDocument()
      expect(screen.getByText(/Beach Cleanup/)).toBeInTheDocument()
    })
  })

  it("shows both application and completion events together", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ id: "a1", type: "application", opportunityTitle: "Food Bank Shift" }),
      makeEvent({ id: "c1", type: "completion", opportunityTitle: "Beach Cleanup" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/Food Bank Shift/)).toBeInTheDocument()
      expect(screen.getByText(/Beach Cleanup/)).toBeInTheDocument()
      expect(screen.getByText(/applied to/)).toBeInTheDocument()
      expect(screen.getByText(/just completed/)).toBeInTheDocument()
    })
  })

  it("does not show badge_earned events in the Activity section", async () => {
    mockGetFeedEvents.mockResolvedValue([
      makeEvent({ id: "b1", type: "badge_earned", badgeName: "First Steps", opportunityTitle: "Park Cleanup" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText("No activity yet.")).toBeInTheDocument()
    })
  })
})

// ─── Featured Opportunities ───────────────────────────────────────────────────
describe("FeedPage Featured Opportunities", () => {
  it("shows 'No featured opportunities' when there are no opportunities", async () => {
    mockGetAllOpportunities.mockResolvedValue([])
    mockGetOpportunitiesForMap.mockResolvedValue([])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText("No featured opportunities right now.")).toBeInTheDocument()
    })
  })

  it("renders opportunity title and organization", async () => {
    mockGetAllOpportunities.mockResolvedValue([
      makeOpp({ title: "Soup Kitchen Volunteer", organization: "Daily Bread" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText("Soup Kitchen Volunteer")).toBeInTheDocument()
      expect(screen.getByText(/Daily Bread/)).toBeInTheDocument()
    })
  })

  it("renders spots remaining", async () => {
    mockGetAllOpportunities.mockResolvedValue([makeOpp({ spotsLeft: 7 })])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/7 spots remaining/)).toBeInTheDocument()
    })
  })

  it("renders the application deadline when present", async () => {
    mockGetAllOpportunities.mockResolvedValue([
      makeOpp({ applicationDeadline: "2026-04-01" }),
    ])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText(/Deadline:/)).toBeInTheDocument()
    })
  })

  it("shows at most 10 featured opportunities", async () => {
    const opps = Array.from({ length: 15 }, (_, i) =>
      makeOpp({ id: `opp-${i}`, title: `Opportunity ${i}` })
    )
    mockGetAllOpportunities.mockResolvedValue(opps)
    await renderFeedPage()
    await waitFor(() => {
      // Each card has "X spots remaining"
      const spotLabels = screen.getAllByText(/spots remaining/)
      expect(spotLabels.length).toBeLessThanOrEqual(10)
    })
  })

  it("renders an 'Apply Now' link for each featured opportunity", async () => {
    mockGetAllOpportunities.mockResolvedValue([makeOpp()])
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Apply Now/i })).toBeInTheDocument()
    })
  })
})

// ─── Map ──────────────────────────────────────────────────────────────────────
describe("FeedPage Community Map", () => {
  it("renders the map stub", async () => {
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByTestId("community-map")).toBeInTheDocument()
    })
  })
})

// ─── Empty state (all sections empty) ────────────────────────────────────────
describe("FeedPage empty states", () => {
  beforeEach(() => {
    mockGetOpportunitiesForMap.mockResolvedValue([])
    mockGetAllOpportunities.mockResolvedValue([])
    mockGetOrgCompletedCounts.mockResolvedValue({})
    mockGetFeedEvents.mockResolvedValue([])
    mockGetStudentProfile.mockResolvedValue(null)
  })

  it("shows all three empty state messages", async () => {
    await renderFeedPage()
    await waitFor(() => {
      expect(screen.getByText("No accomplishments yet.")).toBeInTheDocument()
      expect(screen.getByText("No activity yet.")).toBeInTheDocument()
      expect(screen.getByText("No featured opportunities right now.")).toBeInTheDocument()
    })
  })
})
