import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import ProtectedRoute from "./ProtectedRoute"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}))

describe("ProtectedRoute", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it("shows loader when loading", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      userProfile: null,
      loading: true,
    })

    render(
      <ProtectedRoute>
        <div data-testid="child">Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByTestId("child")).not.toBeInTheDocument()
  })

  it("redirects to /login and returns null when not loading and no user", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
    })

    const { container } = render(
      <ProtectedRoute>
        <div data-testid="child">Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login")
    })
    expect(screen.queryByTestId("child")).not.toBeInTheDocument()
    expect(container.firstChild).toBeNull()
  })

  it("renders children when user is authenticated", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "user-1" },
      userProfile: { role: "student" },
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div data-testid="child">Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(screen.getByTestId("child")).toHaveTextContent("Content")
    expect(mockPush).not.toHaveBeenCalled()
  })
})
