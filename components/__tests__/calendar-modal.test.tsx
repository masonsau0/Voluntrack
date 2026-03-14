import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CalendarModal } from "../calendar-modal"

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("CalendarModal", () => {
  it("renders trigger and opens dialog when clicked", async () => {
    const user = userEvent.setup()
    render(
      <CalendarModal>
        <button type="button">Open Calendar</button>
      </CalendarModal>
    )
    expect(screen.getByRole("button", { name: "Open Calendar" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Open Calendar" }))
    await waitFor(() => {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      const currentMonth = monthNames[new Date().getMonth()]
      expect(screen.getByText(new RegExp(currentMonth))).toBeInTheDocument()
    })
  })

  it("shows weekday headers", async () => {
    const user = userEvent.setup()
    render(
      <CalendarModal>
        <button type="button">Open</button>
      </CalendarModal>
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    await waitFor(() => {
      expect(screen.getByText("Sun")).toBeInTheDocument()
      expect(screen.getByText("Mon")).toBeInTheDocument()
    })
  })

  it("shows Add New Event form when open", async () => {
    const user = userEvent.setup()
    render(
      <CalendarModal>
        <button type="button">Open</button>
      </CalendarModal>
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    await waitFor(() => {
      expect(screen.getByText("Add New Event")).toBeInTheDocument()
      expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Add to Schedule" })).toBeInTheDocument()
    })
  })

  it("shows No events for this day when no events on selected date", async () => {
    const user = userEvent.setup()
    render(
      <CalendarModal>
        <button type="button">Open</button>
      </CalendarModal>
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    await waitFor(() => {
      expect(screen.getByText("No events for this day")).toBeInTheDocument()
    })
  })

})
