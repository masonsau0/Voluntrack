import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import RedirectIfAuthenticated from "./RedirectIfAuthenticated"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}))

describe("RedirectIfAuthenticated", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it("shows loader when loading", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <RedirectIfAuthenticated>
        <div data-testid="child">Login form</div>
      </RedirectIfAuthenticated>
    )

    expect(screen.queryByTestId("child")).not.toBeInTheDocument()
  })

  it("redirects to /opportunities and returns null when user is authenticated", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "user-1" },
      loading: false,
    })

    const { container } = render(
      <RedirectIfAuthenticated>
        <div data-testid="child">Login form</div>
      </RedirectIfAuthenticated>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/opportunities")
    })
    expect(screen.queryByTestId("child")).not.toBeInTheDocument()
    expect(container.firstChild).toBeNull()
  })

  it("renders children when not loading and no user", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <RedirectIfAuthenticated>
        <div data-testid="child">Login form</div>
      </RedirectIfAuthenticated>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(screen.getByTestId("child")).toHaveTextContent("Login form")
    expect(mockPush).not.toHaveBeenCalled()
  })
})
