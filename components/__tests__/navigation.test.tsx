import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Navigation } from "../navigation"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"
import { useNotifications } from "@/hooks/use-notifications"

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/hooks/use-notifications", () => ({
  useNotifications: jest.fn(),
}))

jest.mock("@/components/notification-dropdown", () => ({
  NotificationDropdown: () => <div data-testid="notification-dropdown">Notifications</div>,
}))

describe("Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue("/")
    ;(useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      count: 0,
      refresh: jest.fn(),
      markAsRead: jest.fn(),
    })
  })

  it("renders logo / brand", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      logout: jest.fn(),
    })
    render(<Navigation />)
    const nav = screen.getByRole("navigation")
    expect(nav).toHaveTextContent("Volun")
    expect(nav).toHaveTextContent("Track")
  })

  it("shows Log in and Sign up when not authenticated", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      logout: jest.fn(),
    })
    render(<Navigation />)
    expect(screen.getByRole("link", { name: /Log in/i })).toHaveAttribute("href", "/login")
    expect(screen.getByRole("link", { name: /Sign up/i })).toHaveAttribute("href", "/signup")
  })

  it("shows Opportunities and Dashboard when authenticated and not on org view", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "u1" },
      userProfile: { firstName: "Jane", role: "student" },
      loading: false,
      logout: jest.fn(),
    })
    ;(usePathname as jest.Mock).mockReturnValue("/opportunities")
    render(<Navigation />)
    expect(screen.getByRole("link", { name: /Opportunities/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument()
  })

  it("shows org Dashboard and Opportunities when on org path", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "u1" },
      userProfile: { firstName: "Org User", role: "volunteer_org" },
      loading: false,
      logout: jest.fn(),
    })
    ;(usePathname as jest.Mock).mockReturnValue("/org/dashboard")
    render(<Navigation />)
    const dashboardLinks = screen.getAllByRole("link", { name: /Dashboard/i })
    const opportunitiesLinks = screen.getAllByRole("link", { name: /Opportunities/i })
    expect(dashboardLinks.length).toBeGreaterThan(0)
    expect(opportunitiesLinks.length).toBeGreaterThan(0)
    expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveAttribute("href", "/org/dashboard")
    expect(screen.getByRole("link", { name: /Opportunities/i })).toHaveAttribute("href", "/org/opportunities")
  })

  it("opens mobile menu when hamburger is clicked", async () => {
    const user = userEvent.setup()
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      logout: jest.fn(),
    })
    render(<Navigation />)
    const buttons = screen.getAllByRole("button")
    const hamburger = buttons[buttons.length - 1]
    await user.click(hamburger)
    const signUpLinks = screen.getAllByRole("link", { name: /Sign up/i })
    expect(signUpLinks.length).toBeGreaterThanOrEqual(1)
  })
})
