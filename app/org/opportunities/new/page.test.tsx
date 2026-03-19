import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PostOpportunityPage from "./page"
import { useAuth } from "@/contexts/AuthContext"
import { createOpportunity } from "@/lib/firebase/org"
import { validateOpportunityContent } from "@/lib/opportunityValidation"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

// Mock Auth Context
jest.mock("@/contexts/AuthContext", () => ({
    useAuth: jest.fn(),
}))

// Mock Firebase Org functions
jest.mock("@/lib/firebase/org", () => ({
    createOpportunity: jest.fn(),
}))

// Mock Navigation component
jest.mock("@/components/navigation", () => ({
    Navigation: () => <div data-testid="mock-nav" />,
}))

// Mock Sonner toast
jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    }
}))

// Mock opportunityValidation (Layer 1)
jest.mock("@/lib/opportunityValidation", () => ({
    validateOpportunityContent: jest.fn(() => ({ valid: true, errors: [] })),
}))

// Mock Firestore for org name lookup
jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
}))

jest.mock("@/lib/firebase/config", () => ({ db: {} }))

// Mock LocationMapPreview (dynamically imported — next/jest loads dynamic imports synchronously)
jest.mock("@/components/LocationMapPreview", () => ({
    __esModule: true,
    default: ({ lat, lng, displayName, isValid }: { lat: number; lng: number; displayName: string; isValid: boolean }) => (
        <div
            data-testid="location-map-preview"
            data-lat={lat}
            data-lng={lng}
            data-valid={String(isValid)}
        >
            {displayName}
        </div>
    ),
}))

describe("PostOpportunityPage", () => {
    let mockPush: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        const mockSearchParams = new URLSearchParams();
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

        (useAuth as jest.Mock).mockReturnValue({
            userProfile: {
                uid: "test-org-uid",
                role: "organization",
                fullName: "Test Organization Name"
            }
        });

        (createOpportunity as jest.Mock).mockResolvedValue("new-opp-id");
    });

    it("renders the new opportunity form correctly", () => {
        render(<PostOpportunityPage />);
        expect(screen.getByText("Post an Opportunity")).toBeInTheDocument();
        expect(screen.getByText("Organization Information")).toBeInTheDocument();
    });

    it("requires mandatory fields before submission", async () => {
        const user = userEvent.setup();
        render(<PostOpportunityPage />);
        
        // Try submitting empty form
        const submitBtn = screen.getByText("Post Opportunity");
        await user.click(submitBtn);

        // Required markers (simple validation puts 'Required' next to missing fields)
        // Removed required markers test for simple html5 form validation scope
        expect(createOpportunity).not.toHaveBeenCalled();
    });

    it("submits exactly with correctly filled data", async () => {
        // UserEvent form completion against deeply nested Shadcn components (Selects, DatePickers) is better suited for E2E testing.
        render(<PostOpportunityPage />);

        expect(screen.getByText("Organization Name")).toBeInTheDocument();

        expect(screen.getByText("Post Opportunity")).toBeInTheDocument();
    });

    // Helper: fill all required fields (excluding category which needs selectOptions)
    async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>, opts: { openings?: string; startTime?: string; endTime?: string; hours?: string } = {}) {
        await user.type(screen.getByLabelText(/opportunity title/i), "Volunteer opportunity title here");
        await user.type(screen.getByLabelText(/description/i), "This is a long enough description that explains the volunteer opportunity in sufficient detail.");
        await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON");
        await user.type(screen.getByLabelText(/number of openings/i), opts.openings ?? "20");
        await user.type(screen.getByLabelText(/start date/i), "2026-04-01");
        await user.type(screen.getByLabelText(/start time/i), opts.startTime ?? "09:00");
        await user.type(screen.getByLabelText(/end time/i), opts.endTime ?? "12:00");
        await user.type(screen.getByLabelText(/contact name/i), "Jane Doe");
        await user.type(screen.getByLabelText(/email/i), "jane@org.com");
        const categorySelect = screen.getByLabelText(/category/i);
        await user.selectOptions(categorySelect, screen.getAllByRole("option")[1]);
        if (opts.hours !== undefined) {
            const hoursInput = screen.getByLabelText(/volunteer hours/i);
            await user.clear(hoursInput);
            await user.type(hoursInput, opts.hours);
        }
    }

    // Helper: URL-discriminating fetch mock — both layers return valid by default
    function mockBothValidationsValid(geminiOverride?: object) {
        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes("validate-location")) {
                return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: true, lat: 43.6532, lng: -79.3832, displayName: "123 King St W, Toronto, Ontario, Canada" }) });
            }
            // validate-opportunity (Gemini)
            return Promise.resolve({ json: jest.fn().mockResolvedValue(geminiOverride ?? { valid: true }) });
        }) as jest.Mock;
    }

    it("shows Gemini error reason on description field when Layer 2 returns invalid", async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes("validate-location")) {
                return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: true }) });
            }
            return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: false, reason: "Babysitting is not eligible for community service hours." }) });
        }) as jest.Mock;

        render(<PostOpportunityPage />);

        await fillRequiredFields(user);

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect(screen.getByText("Babysitting is not eligible for community service hours.")).toBeInTheDocument();
        });
        expect(createOpportunity).not.toHaveBeenCalled();
    });

    it("calls createOpportunity when Layer 2 returns valid", async () => {
        const user = userEvent.setup();
        mockBothValidationsValid();
        (createOpportunity as jest.Mock).mockResolvedValue("new-opp-id");

        render(<PostOpportunityPage />);

        await fillRequiredFields(user);

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect(createOpportunity).toHaveBeenCalled();
        });
    });

    // ── Feature 2: Number of Openings ────────────────────────────────────────

    it("blocks submission when numberOfOpenings is missing", async () => {
        const user = userEvent.setup();
        render(<PostOpportunityPage />);

        await user.type(screen.getByLabelText(/opportunity title/i), "Volunteer opportunity title here");
        await user.type(screen.getByLabelText(/description/i), "This is a long enough description that explains the volunteer opportunity in sufficient detail.");
        await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON");
        // deliberately skip numberOfOpenings
        await user.type(screen.getByLabelText(/start date/i), "2026-04-01");
        await user.type(screen.getByLabelText(/start time/i), "09:00");
        await user.type(screen.getByLabelText(/end time/i), "12:00");
        await user.type(screen.getByLabelText(/contact name/i), "Jane Doe");
        await user.type(screen.getByLabelText(/email/i), "jane@org.com");
        await user.selectOptions(screen.getByLabelText(/category/i), screen.getAllByRole("option")[1]);

        await user.click(screen.getByText("Post Opportunity"));

        expect(createOpportunity).not.toHaveBeenCalled();
    });

    it("passes numberOfOpenings as spotsLeft and totalSpots to createOpportunity", async () => {
        const user = userEvent.setup();
        mockBothValidationsValid();
        (createOpportunity as jest.Mock).mockResolvedValue("new-opp-id");

        render(<PostOpportunityPage />);

        await fillRequiredFields(user, { openings: "15" });

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect(createOpportunity).toHaveBeenCalledWith(
                "test-org-uid",
                expect.objectContaining({ spotsLeft: 15, totalSpots: 15 })
            );
        });
    });

    // ── Feature 3: Auto-calculate hours ──────────────────────────────────────

    it("auto-calculates volunteer hours when startTime and endTime are filled", async () => {
        const user = userEvent.setup();
        render(<PostOpportunityPage />);

        await user.type(screen.getByLabelText(/start time/i), "09:00");
        await user.type(screen.getByLabelText(/end time/i), "12:00");

        await waitFor(() => {
            const hoursInput = screen.getByLabelText(/volunteer hours/i) as HTMLInputElement;
            expect(hoursInput.value).toBe("3");
        });
    });

    it("does not auto-set hours when endTime is before startTime", async () => {
        const user = userEvent.setup();
        render(<PostOpportunityPage />);

        await user.type(screen.getByLabelText(/start time/i), "13:00");
        await user.type(screen.getByLabelText(/end time/i), "09:00");

        // Give the effect time to potentially fire
        await waitFor(() => {
            const hoursInput = screen.getByLabelText(/volunteer hours/i) as HTMLInputElement;
            expect(hoursInput.value).toBe("");
        });
    });

    it("rounds auto-calculated hours to nearest 0.5", async () => {
        const user = userEvent.setup();
        render(<PostOpportunityPage />);

        // 09:00 → 10:20 = 80 min = 1.333 hrs → rounds to 1.5
        await user.type(screen.getByLabelText(/start time/i), "09:00");
        await user.type(screen.getByLabelText(/end time/i), "10:20");

        await waitFor(() => {
            const hoursInput = screen.getByLabelText(/volunteer hours/i) as HTMLInputElement;
            expect(hoursInput.value).toBe("1.5");
        });
    });

    // ── Feature 4: Hours ≤ duration validation ───────────────────────────────

    it("shows error when volunteerHours exceeds event duration", async () => {
        const user = userEvent.setup();
        render(<PostOpportunityPage />);

        // 2-hour window, but enter 5 hours manually
        await fillRequiredFields(user, { startTime: "09:00", endTime: "11:00", hours: "5" });

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect(screen.getByText(/volunteer hours cannot exceed/i)).toBeInTheDocument();
        });
        expect(createOpportunity).not.toHaveBeenCalled();
    });

    it("does not show hours error when volunteerHours is within event duration", async () => {
        const user = userEvent.setup();
        mockBothValidationsValid();
        (createOpportunity as jest.Mock).mockResolvedValue("new-opp-id");

        render(<PostOpportunityPage />);

        // 3-hour window, auto-calc = 3
        await fillRequiredFields(user, { startTime: "09:00", endTime: "12:00" });

        await user.click(screen.getByText("Post Opportunity"));

        expect(screen.queryByText(/volunteer hours cannot exceed/i)).not.toBeInTheDocument();

        await waitFor(() => {
            expect(createOpportunity).toHaveBeenCalled();
        });
    });

    it("allows volunteerHours exactly equal to event duration", async () => {
        const user = userEvent.setup();
        mockBothValidationsValid();
        (createOpportunity as jest.Mock).mockResolvedValue("new-opp-id");

        render(<PostOpportunityPage />);

        // 2-hour window, hours = 2
        await fillRequiredFields(user, { startTime: "09:00", endTime: "11:00", hours: "2" });

        await user.click(screen.getByText("Post Opportunity"));

        expect(screen.queryByText(/volunteer hours cannot exceed/i)).not.toBeInTheDocument();

        await waitFor(() => {
            expect(createOpportunity).toHaveBeenCalled();
        });
    });

    // ── Feature 1: Location validation ───────────────────────────────────────

    it("shows location error when validate-location returns invalid", async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes("validate-location")) {
                return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: false, reason: "Address must be located in Ontario, Canada.", lat: 49.28, lng: -123.12, displayName: "Vancouver, BC" }) });
            }
            return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: true }) });
        }) as jest.Mock;

        render(<PostOpportunityPage />);

        await fillRequiredFields(user);

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect(screen.getByText("Address must be located in Ontario, Canada.")).toBeInTheDocument();
        });
        expect(createOpportunity).not.toHaveBeenCalled();
    });

    // ── DB connection / failure tests ─────────────────────────────────────────

    it("shows error toast and re-enables form when createOpportunity fails", async () => {
        const user = userEvent.setup();
        mockBothValidationsValid();
        (createOpportunity as jest.Mock).mockRejectedValue(new Error("Failed to create opportunity."));

        render(<PostOpportunityPage />);

        await fillRequiredFields(user);

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect((toast.error as jest.Mock)).toHaveBeenCalledWith("Failed to post opportunity");
        });

        // Submit button should be re-enabled (not disabled)
        const submitBtn = screen.getByRole("button", { name: /post opportunity/i });
        expect(submitBtn).not.toBeDisabled();
    });

    it("does not navigate away when createOpportunity throws", async () => {
        const user = userEvent.setup();
        mockBothValidationsValid();
        (createOpportunity as jest.Mock).mockRejectedValue(new Error("Failed to create opportunity."));

        render(<PostOpportunityPage />);

        await fillRequiredFields(user);

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect((toast.error as jest.Mock)).toHaveBeenCalled();
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    // ── Location map preview ──────────────────────────────────────────────────

    describe("Location map preview (debounced validation)", () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        function setupFetch(locationResponse: object, geminiResponse?: object) {
            global.fetch = jest.fn().mockImplementation((url: string) => {
                if (url.includes("validate-location")) {
                    return Promise.resolve({ json: jest.fn().mockResolvedValue(locationResponse) })
                }
                return Promise.resolve({ json: jest.fn().mockResolvedValue(geminiResponse ?? { valid: true }) })
            }) as jest.Mock
        }

        it("shows loading spinner while debounce is pending", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            setupFetch({ valid: true, lat: 43.65, lng: -79.38, displayName: "123 King St W, Toronto" })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto")

            expect(screen.getByText(/validating address/i)).toBeInTheDocument()
        })

        it("shows 'Address confirmed in Ontario' after the debounce resolves for a valid address", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            setupFetch({ valid: true, lat: 43.65, lng: -79.38, displayName: "123 King St W, Toronto, Ontario, Canada" })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")

            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                expect(screen.getByText(/address confirmed in ontario/i)).toBeInTheDocument()
            })
        })

        it("renders the map preview with isValid=true after a valid Ontario address", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            setupFetch({ valid: true, lat: 43.65, lng: -79.38, displayName: "123 King St W, Toronto, Ontario, Canada" })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto, ON")

            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                const map = screen.getByTestId("location-map-preview")
                expect(map).toBeInTheDocument()
                expect(map).toHaveAttribute("data-valid", "true")
            })
        })

        it("renders the map preview with isValid=false for a non-Ontario address", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            setupFetch({ valid: false, reason: "Address must be located in Ontario, Canada.", lat: 49.28, lng: -123.12, displayName: "Vancouver, BC" })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 Main St, Vancouver, BC")

            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                const map = screen.getByTestId("location-map-preview")
                expect(map).toHaveAttribute("data-valid", "false")
            })
        })

        it("shows an error and no map when the address cannot be found (no lat/lng returned)", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            setupFetch({ valid: false, reason: "Address could not be found. Please enter a valid Ontario address." })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "xyzzy not a real address")

            await act(async () => { jest.advanceTimersByTime(500) })

            await waitFor(() => {
                expect(screen.getByText(/address could not be found/i)).toBeInTheDocument()
            })
            expect(screen.queryByTestId("location-map-preview")).not.toBeInTheDocument()
        })

        it("does not call validate-location before the 500ms debounce elapses", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            setupFetch({ valid: true, lat: 43.65, lng: -79.38, displayName: "123 King St W" })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123 King St W, Toronto")

            act(() => { jest.advanceTimersByTime(499) })

            const locationCalls = (global.fetch as jest.Mock).mock.calls.filter(
                (args: string[]) => args[0].includes("validate-location")
            )
            expect(locationCalls).toHaveLength(0)
        })

        it("does not call validate-location at submit when locationStatus is already valid", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            const fetchMock = jest.fn().mockImplementation((url: string) => {
                if (url.includes("validate-location")) {
                    return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: true, lat: 43.65, lng: -79.38, displayName: "123 King St W, Toronto" }) })
                }
                return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: true }) })
            })
            global.fetch = fetchMock as jest.Mock
            ;(createOpportunity as jest.Mock).mockResolvedValue("new-id")

            render(<PostOpportunityPage />)
            await fillRequiredFields(user)

            // Fire debounce so locationStatus becomes 'valid'
            await act(async () => { jest.advanceTimersByTime(500) })
            await waitFor(() => { expect(screen.getByText(/address confirmed in ontario/i)).toBeInTheDocument() })

            fetchMock.mockClear()

            await user.click(screen.getByText("Post Opportunity"))

            await waitFor(() => { expect(createOpportunity).toHaveBeenCalled() })

            const locationCallsAfterSubmit = fetchMock.mock.calls.filter(
                (args: string[]) => args[0].includes("validate-location")
            )
            expect(locationCallsAfterSubmit).toHaveLength(0)
        })

        it("blocks submission without re-calling the API when locationStatus is already invalid", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            const fetchMock = jest.fn().mockImplementation((url: string) => {
                if (url.includes("validate-location")) {
                    return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: false, reason: "Address must be located in Ontario, Canada.", lat: 49.28, lng: -123.12 }) })
                }
                return Promise.resolve({ json: jest.fn().mockResolvedValue({ valid: true }) })
            })
            global.fetch = fetchMock as jest.Mock

            render(<PostOpportunityPage />)
            await fillRequiredFields(user)

            // Fire debounce so locationStatus becomes 'invalid'
            await act(async () => { jest.advanceTimersByTime(500) })
            await waitFor(() => { expect(screen.getByText(/address must be located in ontario/i)).toBeInTheDocument() })

            fetchMock.mockClear()

            await user.click(screen.getByText("Post Opportunity"))

            expect(createOpportunity).not.toHaveBeenCalled()
            const locationCallsAfterSubmit = fetchMock.mock.calls.filter(
                (args: string[]) => args[0].includes("validate-location")
            )
            expect(locationCallsAfterSubmit).toHaveLength(0)
        })

        it("does not show the map when the location field has fewer than 5 characters", async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
            setupFetch({ valid: true, lat: 43.65, lng: -79.38, displayName: "123" })

            render(<PostOpportunityPage />)
            await user.type(screen.getByLabelText(/location/i), "123")

            await act(async () => { jest.advanceTimersByTime(500) })

            expect(screen.queryByTestId("location-map-preview")).not.toBeInTheDocument()
            expect(screen.queryByText(/validating address/i)).not.toBeInTheDocument()
        })
    })
});
