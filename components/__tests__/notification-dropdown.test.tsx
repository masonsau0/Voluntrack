import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NotificationDropdown } from "../notification-dropdown"

jest.mock("@/components/reflection-modal", () => ({
  ReflectionModal: ({ open, onOpenChange, opportunityTitle }: any) =>
    open ? (
      <div data-testid="reflection-modal">
        <span>Reflect: {opportunityTitle}</span>
        <button type="button" onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}))

describe("NotificationDropdown", () => {
  it("renders notification bell trigger", () => {
    render(
      <NotificationDropdown
        notifications={[]}
        count={0}
        onReflectionSubmitted={jest.fn()}
        onMarkRead={jest.fn()}
      />
    )
    const trigger = document.getElementById("notification-bell")
    expect(trigger).toBeInTheDocument()
  })

  it("shows all caught up when notifications are empty", async () => {
    const user = userEvent.setup()
    render(
      <NotificationDropdown
        notifications={[]}
        count={0}
        onReflectionSubmitted={jest.fn()}
        onMarkRead={jest.fn()}
      />
    )
    const trigger = document.getElementById("notification-bell")
    if (trigger) await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByText(/You're all caught up!/i)).toBeInTheDocument()
      expect(screen.getByText(/No pending reflections right now/i)).toBeInTheDocument()
    })
  })

  it("shows notification header when dropdown is open", async () => {
    const user = userEvent.setup()
    render(
      <NotificationDropdown
        notifications={[]}
        count={0}
        onReflectionSubmitted={jest.fn()}
        onMarkRead={jest.fn()}
      />
    )
    const trigger = document.getElementById("notification-bell")
    if (trigger) await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument()
    })
  })

  it("shows decision notification when provided", async () => {
    const user = userEvent.setup()
    const onMarkRead = jest.fn()
    const notif = {
      type: "decision" as const,
      id: "n1",
      notificationId: "notif-1",
      message: "Your application was approved",
      status: "approved" as const,
      unread: true,
      timestamp: { toDate: () => new Date() },
    }
    render(
      <NotificationDropdown
        notifications={[notif]}
        count={1}
        onReflectionSubmitted={jest.fn()}
        onMarkRead={onMarkRead}
      />
    )
    const trigger = document.getElementById("notification-bell")
    if (trigger) await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByText("Your application was approved")).toBeInTheDocument()
    })
  })

  it("opens reflection modal when reflection_due notification is clicked", async () => {
    const user = userEvent.setup()
    const notif = {
      type: "reflection_due" as const,
      id: "r1",
      title: "Reflect on Soup Kitchen",
      organization: "Soup Kitchen Inc",
      date: "Mar 15",
      opportunityId: "opp-1",
    }
    render(
      <NotificationDropdown
        notifications={[notif]}
        count={1}
        onReflectionSubmitted={jest.fn()}
        onMarkRead={jest.fn()}
      />
    )
    const trigger = document.getElementById("notification-bell")
    if (trigger) await user.click(trigger)
    await waitFor(() => {
      expect(screen.getByText("Reflect on Soup Kitchen")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Reflect on Soup Kitchen"))
    await waitFor(() => {
      expect(screen.getByTestId("reflection-modal")).toBeInTheDocument()
      expect(screen.getByText(/Reflect: Reflect on Soup Kitchen/)).toBeInTheDocument()
    })
  })
})
