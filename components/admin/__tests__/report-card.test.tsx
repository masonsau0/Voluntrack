import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReportCard } from "../report-card"
import type { AdminReport } from "@/app/api/admin/reports/route"

const BASE_REPORT: AdminReport = {
  id: "report-1",
  reporterId: "student-abc",
  opportunityId: "opp-xyz",
  orgId: "org-1",
  reason: "Household chores",
  text: "",
  createdAt: "2024-03-10T08:00:00.000Z",
  opportunityTitle: "Park Cleanup",
}

const REPORT_WITH_TEXT: AdminReport = {
  ...BASE_REPORT,
  reason: "Other",
  text: "This seems like a paid job posted as volunteering.",
}

describe("ReportCard", () => {
  const onRemove = jest.fn()
  const onAllow = jest.fn()
  const onEditClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── Rendering ───────────────────────────────────────────────────────────────

  it("renders the opportunity title", () => {
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.getByText("Park Cleanup")).toBeInTheDocument()
  })

  it("renders the report reason", () => {
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.getByText("Household chores")).toBeInTheDocument()
  })

  it("renders 'Pending Review' status badge", () => {
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.getByText("Pending Review")).toBeInTheDocument()
  })

  it("renders formatted report date", () => {
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.getByText(/Reported/i)).toBeInTheDocument()
  })

  it("does not render the 'Additional details' section when text is empty", () => {
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.queryByText(/additional details/i)).not.toBeInTheDocument()
  })

  it("renders the 'Additional details' section when text is non-empty", () => {
    render(
      <ReportCard
        report={REPORT_WITH_TEXT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.getByText(/additional details/i)).toBeInTheDocument()
    expect(
      screen.getByText("This seems like a paid job posted as volunteering.")
    ).toBeInTheDocument()
  })

  it("renders all three action buttons", () => {
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.getByRole("button", { name: /remove opportunity/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /edit opportunity/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /allow \/ dismiss/i })).toBeInTheDocument()
  })

  // ── Button callbacks ────────────────────────────────────────────────────────

  it("calls onRemove with reportId and opportunityId when Remove is clicked", async () => {
    const user = userEvent.setup()
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )

    await user.click(screen.getByRole("button", { name: /remove opportunity/i }))

    expect(onRemove).toHaveBeenCalledWith("report-1", "opp-xyz")
    expect(onAllow).not.toHaveBeenCalled()
    expect(onEditClick).not.toHaveBeenCalled()
  })

  it("calls onAllow with reportId when Allow/Dismiss is clicked", async () => {
    const user = userEvent.setup()
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )

    await user.click(screen.getByRole("button", { name: /allow \/ dismiss/i }))

    expect(onAllow).toHaveBeenCalledWith("report-1")
    expect(onRemove).not.toHaveBeenCalled()
    expect(onEditClick).not.toHaveBeenCalled()
  })

  it("calls onEditClick with the full report object when Edit is clicked", async () => {
    const user = userEvent.setup()
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )

    await user.click(screen.getByRole("button", { name: /edit opportunity/i }))

    expect(onEditClick).toHaveBeenCalledWith(BASE_REPORT)
    expect(onRemove).not.toHaveBeenCalled()
    expect(onAllow).not.toHaveBeenCalled()
  })

  // ── Edge cases ──────────────────────────────────────────────────────────────

  it("renders reason 'Other' correctly alongside text", () => {
    render(
      <ReportCard
        report={REPORT_WITH_TEXT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )
    expect(screen.getByText("Other")).toBeInTheDocument()
  })

  it("each button fires its handler exactly once per click", async () => {
    const user = userEvent.setup()
    render(
      <ReportCard
        report={BASE_REPORT}
        onRemove={onRemove}
        onAllow={onAllow}
        onEditClick={onEditClick}
      />
    )

    await user.click(screen.getByRole("button", { name: /remove opportunity/i }))
    await user.click(screen.getByRole("button", { name: /allow \/ dismiss/i }))
    await user.click(screen.getByRole("button", { name: /edit opportunity/i }))

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onAllow).toHaveBeenCalledTimes(1)
    expect(onEditClick).toHaveBeenCalledTimes(1)
  })
})
