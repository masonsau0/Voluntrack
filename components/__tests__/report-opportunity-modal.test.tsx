import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReportOpportunityModal } from "../report-opportunity-modal"

jest.mock("@/lib/firebase/reports", () => ({
  submitReport: jest.fn(),
}))

jest.mock("@/lib/firebase/hidden-opportunities", () => ({
  hideOpportunity: jest.fn(),
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import { submitReport } from "@/lib/firebase/reports"
import { hideOpportunity } from "@/lib/firebase/hidden-opportunities"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const mockSubmitReport = submitReport as jest.Mock
const mockHideOpportunity = hideOpportunity as jest.Mock
const mockUseAuth = useAuth as jest.Mock
const mockToastSuccess = toast.success as jest.Mock
const mockToastError = toast.error as jest.Mock

const DEFAULT_PROPS = {
  open: true,
  onOpenChange: jest.fn(),
  opportunityId: "opp-123",
  opportunityTitle: "Food Bank Sorting",
  onReportSubmitted: jest.fn(),
}

describe("ReportOpportunityModal", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { uid: "student-1" } })
    mockSubmitReport.mockResolvedValue("report-1")
    mockHideOpportunity.mockResolvedValue(undefined)
  })

  // ── Rendering ───────────────────────────────────────────────────────────────

  it("renders the dialog title", () => {
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)
    expect(screen.getByText("Report Opportunity")).toBeInTheDocument()
  })

  it("shows the opportunity title in the description", () => {
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)
    expect(screen.getByText(/Food Bank Sorting/)).toBeInTheDocument()
  })

  it("renders all six predefined reason options", () => {
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    expect(screen.getByText("Household chores")).toBeInTheDocument()
    expect(screen.getByText("Normally-paid work (babysitting, lawn mowing, etc.)")).toBeInTheDocument()
    expect(screen.getByText("Court-ordered community service")).toBeInTheDocument()
    expect(screen.getByText("Requires vehicle operation or power tools")).toBeInTheDocument()
    expect(screen.getByText("Not a legitimate volunteer opportunity")).toBeInTheDocument()
    expect(screen.getByText("Other")).toBeInTheDocument()
  })

  it("does not show the textarea when no reason is selected", () => {
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)
    expect(screen.queryByPlaceholderText(/describe your concern/i)).not.toBeInTheDocument()
  })

  it("does not show the textarea when a predefined reason is selected", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Household chores"))

    expect(screen.queryByPlaceholderText(/describe your concern/i)).not.toBeInTheDocument()
  })

  it("shows the textarea when 'Other' is selected", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Other"))

    expect(screen.getByPlaceholderText(/describe your concern/i)).toBeInTheDocument()
  })

  it("shows character counter when 'Other' textarea is visible", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Other"))

    expect(screen.getByText(/0 \/ 1000/)).toBeInTheDocument()
  })

  // ── Submission — predefined reason ─────────────────────────────────────────

  it("submits with a predefined reason and empty text", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Household chores"))
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockSubmitReport).toHaveBeenCalledWith(
        "student-1",
        "opp-123",
        "Household chores",
        ""
      )
    })
  })

  it("calls hideOpportunity after submitReport succeeds", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Court-ordered community service"))
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockHideOpportunity).toHaveBeenCalledWith("student-1", "opp-123")
    })
  })

  it("calls onReportSubmitted callback on success", async () => {
    const onReportSubmitted = jest.fn()
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} onReportSubmitted={onReportSubmitted} />)

    await user.click(screen.getByText("Household chores"))
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(onReportSubmitted).toHaveBeenCalled()
    })
  })

  it("shows success toast on successful submission", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Household chores"))
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled()
    })
  })

  // ── Submission — "Other" with custom text ───────────────────────────────────

  it("submits with reason='Other' and the custom text", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Other"))
    await user.type(
      screen.getByPlaceholderText(/describe your concern/i),
      "This appears to be a paid babysitting position."
    )
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockSubmitReport).toHaveBeenCalledWith(
        "student-1",
        "opp-123",
        "Other",
        "This appears to be a paid babysitting position."
      )
    })
  })

  it("shows validation error when 'Other' text is fewer than 20 chars", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Other"))
    await user.type(screen.getByPlaceholderText(/describe your concern/i), "Too short")
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument()
    })
    expect(mockSubmitReport).not.toHaveBeenCalled()
  })

  it("does not show validation error when 'Other' text is 20+ chars", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Other"))
    await user.type(
      screen.getByPlaceholderText(/describe your concern/i),
      "This is exactly twenty chars."
    )
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockSubmitReport).toHaveBeenCalled()
    })
    expect(screen.queryByText(/at least 20 characters/i)).not.toBeInTheDocument()
  })

  // ── Error handling ──────────────────────────────────────────────────────────

  it("shows error toast when submitReport throws", async () => {
    mockSubmitReport.mockRejectedValue(new Error("Opportunity not found."))
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Household chores"))
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })
    expect(DEFAULT_PROPS.onReportSubmitted).not.toHaveBeenCalled()
  })

  it("does not hide opportunity when submitReport throws", async () => {
    mockSubmitReport.mockRejectedValue(new Error("network error"))
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Household chores"))
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })
    expect(mockHideOpportunity).not.toHaveBeenCalled()
  })

  it("shows error toast when user is not logged in", async () => {
    mockUseAuth.mockReturnValue({ user: null })
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Household chores"))
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("You must be logged in.")
    })
    expect(mockSubmitReport).not.toHaveBeenCalled()
  })

  // ── Cancel ──────────────────────────────────────────────────────────────────

  it("calls onOpenChange(false) when Cancel is clicked", async () => {
    const onOpenChange = jest.fn()
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("does not submit the form when Cancel is clicked", async () => {
    const user = userEvent.setup()
    render(<ReportOpportunityModal {...DEFAULT_PROPS} />)

    await user.click(screen.getByText("Household chores"))
    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(mockSubmitReport).not.toHaveBeenCalled()
  })
})
