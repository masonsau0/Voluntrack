import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReflectionModal } from "../reflection-modal"
import { submitReflection } from "@/lib/firebase/dashboard"
import { toast } from "sonner"

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

jest.mock("@/lib/firebase/dashboard", () => ({
  submitReflection: jest.fn(),
}))

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "user-1" } }),
}))

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  opportunityId: "opp-1",
  opportunityTitle: "Beach Cleanup",
  organizationName: "Eco Org",
}

describe("ReflectionModal", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders title and description when open", () => {
    render(<ReflectionModal {...defaultProps} />)
    expect(screen.getByText("Reflect on Your Experience")).toBeInTheDocument()
    expect(screen.getByText(/Beach Cleanup/)).toBeInTheDocument()
    expect(screen.getByText(/Eco Org/)).toBeInTheDocument()
  })

  it("renders form fields for org description, how helped, what learned", () => {
    render(<ReflectionModal {...defaultProps} />)
    expect(screen.getByLabelText(/What does this organization do/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/How did you help/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/What did you learn/i)).toBeInTheDocument()
  })

  it("shows validation errors when submitting empty", async () => {
    render(<ReflectionModal {...defaultProps} />)
    fireEvent.click(screen.getByRole("button", { name: "Submit Reflection" }))
    await waitFor(() => {
      const errors = screen.getAllByText(/Please write at least 10 characters/)
      expect(errors.length).toBeGreaterThanOrEqual(1)
    })
    expect(submitReflection).not.toHaveBeenCalled()
  })

  it("calls onOpenChange(false) when Later is clicked", async () => {
    const onOpenChange = jest.fn()
    render(<ReflectionModal {...defaultProps} onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Later" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("submits reflection and calls onSuccess when form is valid", async () => {
    const onSuccess = jest.fn()
    ;(submitReflection as jest.Mock).mockResolvedValue(undefined)
    render(<ReflectionModal {...defaultProps} onSuccess={onSuccess} />)

    await userEvent.type(screen.getByLabelText(/What does this organization do/i), "They help the environment.")
    await userEvent.type(screen.getByLabelText(/How did you help/i), "I picked up trash on the beach.")
    await userEvent.type(screen.getByLabelText(/What did you learn/i), "I learned about plastic pollution.")

    await userEvent.click(screen.getByRole("button", { name: "Submit Reflection" }))

    await waitFor(() => {
      expect(submitReflection).toHaveBeenCalledWith("user-1", "opp-1", {
        orgDescription: "They help the environment.",
        howHelped: "I picked up trash on the beach.",
        whatLearned: "I learned about plastic pollution.",
      })
    })
    expect(toast.success).toHaveBeenCalledWith("Reflection submitted! Thank you for sharing your experience.")
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    expect(onSuccess).toHaveBeenCalled()
  })
})
