import React from "react"
import { render, screen } from "@testing-library/react"
import { HorizontalProgressTracker } from "../horizontal-progress-tracker"

describe("HorizontalProgressTracker", () => {
  it("renders Hours Progress heading", () => {
    render(<HorizontalProgressTracker completedHours={0} goalHours={40} />)
    expect(screen.getByText("Hours Progress")).toBeInTheDocument()
  })

  it("displays completed and goal hours", () => {
    render(<HorizontalProgressTracker completedHours={15} goalHours={40} />)
    expect(screen.getByText("15")).toBeInTheDocument()
    expect(screen.getByText(/\/ 40 hours/)).toBeInTheDocument()
  })

  it("displays level title based on completed hours", () => {
    render(<HorizontalProgressTracker completedHours={0} goalHours={40} />)
    expect(screen.getByText("Novice Volunteer")).toBeInTheDocument()
  })

  it("displays Community Helper at 10 hours", () => {
    render(<HorizontalProgressTracker completedHours={10} goalHours={40} />)
    expect(screen.getByText("Community Helper")).toBeInTheDocument()
  })

  it("shows hours left when under goal", () => {
    render(<HorizontalProgressTracker completedHours={10} goalHours={40} />)
    expect(screen.getByText(/30h to Complete/)).toBeInTheDocument()
  })
})
