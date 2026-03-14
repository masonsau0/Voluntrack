import React from "react"
import { render, screen } from "@testing-library/react"
import { Providers } from "../providers"

jest.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}))

jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

jest.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div data-testid="role-guard">{children}</div>,
}))

describe("Providers", () => {
  it("renders children inside AuthProvider and RoleGuard", () => {
    render(
      <Providers>
        <span data-testid="child">App content</span>
      </Providers>
    )
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument()
    expect(screen.getByTestId("role-guard")).toBeInTheDocument()
    expect(screen.getByTestId("child")).toHaveTextContent("App content")
  })

  it("renders Toaster", () => {
    render(
      <Providers>
        <div>Child</div>
      </Providers>
    )
    expect(screen.getByTestId("toaster")).toBeInTheDocument()
  })
})
