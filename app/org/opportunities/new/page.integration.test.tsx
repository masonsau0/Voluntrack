/**
 * Integration tests for the opportunity creation page + LocationMapPreview.
 *
 * Unlike page.test.tsx (which mocks LocationMapPreview entirely), these tests
 * render the real LocationMapPreview component so that the data flow from the
 * validate-location API response → page state → LocationMapPreview props →
 * GoogleMap/Marker is verified end-to-end within jsdom.
 *
 * @react-google-maps/api is mocked at the leaf level (GoogleMap, Marker) since
 * it requires a real browser environment to load the Maps JS SDK.
 */

import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PostOpportunityPage from "./page"
import { useAuth } from "@/contexts/AuthContext"
import { createOpportunity } from "@/lib/firebase/org"
import { useRouter, useSearchParams } from "next/navigation"

// ── Leaf-level Google Maps mock (keeps LocationMapPreview real) ──────────────
jest.mock("@react-google-maps/api", () => ({
    useJsApiLoader: jest.fn().mockReturnValue({ isLoaded: true }),
    GoogleMap: ({
        children,
        center,
        zoom,
    }: {
        children?: React.ReactNode
        center: { lat: number; lng: number }
        zoom: number
    }) => (
        <div
            data-testid="google-map"
            data-lat={center?.lat}
            data-lng={center?.lng}
            data-zoom={zoom}
        >
            {children}
        </div>
    ),
    Marker: ({
        position,
        title,
    }: {
        position: { lat: number; lng: number }
        title?: string
    }) => (
        <div
            data-testid="google-marker"
            data-lat={position?.lat}
            data-lng={position?.lng}
            data-title={title}
        />
    ),
}))

// ── Infrastructure mocks ─────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

jest.mock("@/contexts/AuthContext", () => ({
    useAuth: jest.fn(),
}))

jest.mock("@/lib/firebase/org", () => ({
    createOpportunity: jest.fn(),
}))

jest.mock("@/components/navigation", () => ({
    Navigation: () => <div data-testid="mock-nav" />,
}))

jest.mock("sonner", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}))

jest.mock("@/lib/opportunityValidation", () => ({
    validateOpportunityContent: jest.fn(() => ({ valid: true, errors: [] })),
}))

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
}))

jest.mock("@/lib/firebase/config", () => ({ db: {} }))

// ── Helpers ──────────────────────────────────────────────────────────────────
function setupFetch(locationResponse: object) {
    global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes("validate-location")) {
            return Promise.resolve({ json: jest.fn().mockResolvedValue(locationResponse) })
        }
        return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: true }) })
    }) as jest.Mock
}

describe("PostOpportunityPage + LocationMapPreview (integration)", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
        ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
        ;(useAuth as jest.Mock).mockReturnValue({
            userProfile: { uid: "test-uid", role: "organization" },
        })
        ;(createOpportunity as jest.Mock).mockResolvedValue("new-opp-id")
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe("coordinate data flow: API response → GoogleMap / Marker", () => {
        it("passes the correct lat and lng from the API response to GoogleMap center", async () => {
            setupFetch({ valid: true, lat: 43.6532, lng: -79.3832, displayName: "123 King St W, Toronto, Ontario, Canada" })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                const map = screen.getByTestId("google-map")
                expect(map).toHaveAttribute("data-lat", "43.6532")
                expect(map).toHaveAttribute("data-lng", "-79.3832")
            })
        })

        it("passes the correct lat and lng from the API response to the Marker position", async () => {
            setupFetch({ valid: true, lat: 43.6532, lng: -79.3832, displayName: "123 King St W, Toronto, Ontario, Canada" })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                const marker = screen.getByTestId("google-marker")
                expect(marker).toHaveAttribute("data-lat", "43.6532")
                expect(marker).toHaveAttribute("data-lng", "-79.3832")
            })
        })

        it("passes displayName from the API response as the Marker title", async () => {
            setupFetch({ valid: true, lat: 43.6532, lng: -79.3832, displayName: "123 King St W, Toronto, Ontario, Canada" })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                expect(screen.getByTestId("google-marker")).toHaveAttribute(
                    "data-title",
                    "123 King St W, Toronto, Ontario, Canada"
                )
            })
        })

        it("falls back to the raw form value as the Marker title when API returns no displayName", async () => {
            setupFetch({ valid: true, lat: 43.6532, lng: -79.3832 })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                expect(screen.getByTestId("google-marker")).toHaveAttribute(
                    "data-title",
                    "123 King St W, Toronto, ON"
                )
            })
        })
    })

    describe("Ontario warning banner (isValid prop flow)", () => {
        it("does not show the Ontario banner for a valid Ontario address", async () => {
            setupFetch({ valid: true, lat: 43.6532, lng: -79.3832, displayName: "123 King St W, Toronto, Ontario, Canada" })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => expect(screen.getByTestId("google-map")).toBeInTheDocument())
            expect(screen.queryByText(/not in ontario/i)).not.toBeInTheDocument()
        })

        it("shows the Ontario banner when the API returns valid: false with coordinates", async () => {
            setupFetch({ valid: false, lat: 49.2827, lng: -123.1207, displayName: "Vancouver, BC", reason: "Address must be located in Ontario, Canada." })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 Main St, Vancouver, BC")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => expect(screen.getByText(/not in ontario/i)).toBeInTheDocument())
        })
    })

    describe("no map when address is unresolvable", () => {
        it("does not render a map when the API returns no coordinates", async () => {
            setupFetch({ valid: false, reason: "Address could not be found. Please enter a valid Ontario address." })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "xyzzy not a real address")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => expect(screen.getByText(/address could not be found/i)).toBeInTheDocument())
            expect(screen.queryByTestId("google-map")).not.toBeInTheDocument()
        })
    })

    describe("debounce cancellation", () => {
        it("only calls validate-location once when the user types quickly", async () => {
            setupFetch({ valid: true, lat: 43.6532, lng: -79.3832, displayName: "123 King St W, Toronto, Ontario, Canada" })
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })

            render(<PostOpportunityPage />)

            // Simulate rapid typing — each character resets the 500ms timer
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")
            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => screen.getByTestId("google-map"))

            const locationCalls = (global.fetch as jest.Mock).mock.calls.filter(
                (args: string[]) => args[0].includes("validate-location")
            )
            expect(locationCalls).toHaveLength(1)
        })
    })
})
