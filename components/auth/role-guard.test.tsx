import { render, screen, waitFor } from "@testing-library/react"
import { RoleGuard } from "./role-guard"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}))

describe("RoleGuard", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it("shows loader while checking auth", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      userProfile: null,
      loading: true,
    })
    ;(usePathname as jest.Mock).mockReturnValue("/opportunities")

    render(
      <RoleGuard>
        <div data-testid="child">Content</div>
      </RoleGuard>
    )

    // Should not render children
    expect(screen.queryByTestId("child")).not.toBeInTheDocument()
  })

  it("allows unauthenticated users (handled by other guards)", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
    })
    ;(usePathname as jest.Mock).mockReturnValue("/opportunities")

    render(
      <RoleGuard>
        <div data-testid="child">Content</div>
      </RoleGuard>
    )

    // Should render children
    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects volunteer_org users away from non-org routes", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123" },
      userProfile: { role: "volunteer_org" },
      loading: false,
    })
    ;(usePathname as jest.Mock).mockReturnValue("/opportunities")

    const { container } = render(
      <RoleGuard>
        <div data-testid="child">Content</div>
      </RoleGuard>
    )

    // Returns null to avoid flash of content
    expect(container).toBeEmptyDOMElement()
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/org/dashboard")
    })
  })

  it("allows volunteer_org users on /org routes", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123" },
      userProfile: { role: "volunteer_org" },
      loading: false,
    })
    ;(usePathname as jest.Mock).mockReturnValue("/org/opportunities")

    render(
      <RoleGuard>
        <div data-testid="child">Content</div>
      </RoleGuard>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects student users away from /org routes", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123" },
      userProfile: { role: "student" },
      loading: false,
    })
    ;(usePathname as jest.Mock).mockReturnValue("/org/dashboard")

    const { container } = render(
      <RoleGuard>
        <div data-testid="child">Content</div>
      </RoleGuard>
    )

    // Returns null to avoid flash of content
    expect(container).toBeEmptyDOMElement()
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/opportunities")
    })
  })

  it("allows student users on non-org routes", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123" },
      userProfile: { role: "student" },
      loading: false,
    })
    ;(usePathname as jest.Mock).mockReturnValue("/opportunities")

    render(
      <RoleGuard>
        <div data-testid="child">Content</div>
      </RoleGuard>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("allows volunteer_org users on auth routes", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123" },
      userProfile: { role: "volunteer_org" },
      loading: false,
    })
    ;(usePathname as jest.Mock).mockReturnValue("/login")

    render(
      <RoleGuard>
        <div data-testid="child">Content</div>
      </RoleGuard>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
