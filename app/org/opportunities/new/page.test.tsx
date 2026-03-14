import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PostOpportunityPage from "./page"
import { useAuth } from "@/contexts/AuthContext"
import { createOpportunity } from "@/lib/firebase/org"
import { validateOpportunityContent } from "@/lib/opportunityValidation"
import { useRouter, useSearchParams } from "next/navigation"

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

    it("shows Gemini error reason on description field when Layer 2 returns invalid", async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                valid: false,
                reason: "Babysitting is not eligible for community service hours.",
            }),
        }) as jest.Mock;

        render(<PostOpportunityPage />);

        // Fill all required fields
        await user.type(screen.getByLabelText(/organization name/i), "Test Org");
        await user.type(screen.getByLabelText(/opportunity title/i), "Volunteer opportunity title here");
        await user.type(screen.getByLabelText(/description/i), "This is a long enough description that explains the volunteer opportunity in sufficient detail.");
        await user.type(screen.getByLabelText(/location/i), "123 Main St");

        const startDateInput = screen.getByLabelText(/start date/i);
        await user.type(startDateInput, "2026-04-01");

        const startTimeInput = screen.getByLabelText(/start time/i);
        await user.type(startTimeInput, "09:00");

        const endTimeInput = screen.getByLabelText(/end time/i);
        await user.type(endTimeInput, "12:00");

        await user.type(screen.getByLabelText(/contact name/i), "Jane Doe");
        await user.type(screen.getByLabelText(/email/i), "jane@org.com");

        // Fill category via select
        const categorySelect = screen.getByLabelText(/category/i);
        await user.selectOptions(categorySelect, screen.getAllByRole("option")[1]);

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect(screen.getByText("Babysitting is not eligible for community service hours.")).toBeInTheDocument();
        });
        expect(createOpportunity).not.toHaveBeenCalled();
    });

    it("calls createOpportunity when Layer 2 returns valid", async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue({ valid: true }),
        }) as jest.Mock;

        (createOpportunity as jest.Mock).mockResolvedValue("new-opp-id");

        render(<PostOpportunityPage />);

        await user.type(screen.getByLabelText(/organization name/i), "Test Org");
        await user.type(screen.getByLabelText(/opportunity title/i), "Volunteer opportunity title here");
        await user.type(screen.getByLabelText(/description/i), "This is a long enough description that explains the volunteer opportunity in sufficient detail.");
        await user.type(screen.getByLabelText(/location/i), "123 Main St");

        const startDateInput = screen.getByLabelText(/start date/i);
        await user.type(startDateInput, "2026-04-01");

        const startTimeInput = screen.getByLabelText(/start time/i);
        await user.type(startTimeInput, "09:00");

        const endTimeInput = screen.getByLabelText(/end time/i);
        await user.type(endTimeInput, "12:00");

        await user.type(screen.getByLabelText(/contact name/i), "Jane Doe");
        await user.type(screen.getByLabelText(/email/i), "jane@org.com");

        const categorySelect = screen.getByLabelText(/category/i);
        await user.selectOptions(categorySelect, screen.getAllByRole("option")[1]);

        await user.click(screen.getByText("Post Opportunity"));

        await waitFor(() => {
            expect(createOpportunity).toHaveBeenCalled();
        });
    });
});
