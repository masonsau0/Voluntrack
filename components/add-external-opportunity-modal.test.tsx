import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddExternalOpportunityModal } from "./add-external-opportunity-modal"
import { submitExternalOpportunity } from "@/lib/firebase/dashboard"
import { toast } from "sonner"

// Radix dialog requires ResizeObserver and PointerEvent which might not exist in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined" && !window.PointerEvent) {
  // @ts-ignore
  window.PointerEvent = class PointerEvent extends Event {}
}

jest.mock("@/lib/firebase/dashboard", () => ({
  submitExternalOpportunity: jest.fn(),
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "test-user-id" }
  })
}))

jest.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, children }: any) => (
    <div data-testid="mock-select" onClick={() => onValueChange("Environment")}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <button type="button" aria-haspopup="listbox" role="combobox">{children}</button>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

describe("AddExternalOpportunityModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the modal properly", () => {
    render(<AddExternalOpportunityModal {...defaultProps} />)
    expect(screen.getByText("Add External Opportunity")).toBeInTheDocument()
    // Find generic inputs
    expect(screen.getByLabelText(/Opportunity Title \*/i)).toBeInTheDocument()
  })

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<AddExternalOpportunityModal {...defaultProps} />)
    
    // Submit without filling fields
    const submitBtn = screen.getByRole("button", { name: "Submit Opportunity" })
    fireEvent.click(submitBtn)

    // Wait for the Zod resolver errors
    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument()
      expect(screen.getByText("Organization is required")).toBeInTheDocument()
    })
    
    // Check that submit wasn't called
    expect(submitExternalOpportunity).not.toHaveBeenCalled()
  })

  it("submits the form properly when all required fields are filled", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<AddExternalOpportunityModal {...defaultProps} />)
    
    // Fill out inputs
    await user.type(screen.getByLabelText(/Opportunity Title \*/i), "Test Cleanup")
    await user.type(screen.getByLabelText(/Organization Name \*/i), "Test Org")
    
    const dateInput = screen.getByLabelText(/Date Completed \*/i)
    await user.type(dateInput, "2026-05-15")
    
    const hoursInput = screen.getByLabelText(/Hours \*/i)
    await user.type(hoursInput, "2.5")

    const mockSelect = screen.getByTestId("mock-select")
    fireEvent.click(mockSelect)

    // Reflection
    await user.type(screen.getByLabelText(/Reflection \*/i), "This is a great 10 char string")
    
    // Contacts
    await user.type(screen.getByLabelText(/Contact Name/i), "John Doe")
    await user.type(screen.getByLabelText(/Contact Email \*/i), "john@example.com")

    const submitBtn = screen.getByRole("button", { name: "Submit Opportunity" })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      const errors = screen.queryAllByText(/is required|must be at least|Invalid email/i)
      if (errors.length > 0) {
        console.error("Validation errors found:", errors.map(e => e.textContent))
      }
      expect(submitExternalOpportunity).toHaveBeenCalledWith("test-user-id", expect.any(Object))
    })

    expect(submitExternalOpportunity).toHaveBeenCalledWith("test-user-id", {
      title: "Test Cleanup",
      organization: "Test Org",
      date: "2026-05-15",
      hours: 2.5,
      category: expect.any(String),
      reflection: "This is a great 10 char string",
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "",
    })

    expect(toast.success).toHaveBeenCalledWith("External opportunity logged successfully!")
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    expect(defaultProps.onSuccess).toHaveBeenCalled()
  })

})
