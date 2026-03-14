import React from "react"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "../theme-provider"

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="next-themes-provider">{children}</div>,
}))

describe("ThemeProvider", () => {
  it("renders children inside next-themes ThemeProvider", () => {
    render(
      <ThemeProvider>
        <span data-testid="child">Themed content</span>
      </ThemeProvider>
    )
    expect(screen.getByTestId("next-themes-provider")).toBeInTheDocument()
    expect(screen.getByTestId("child")).toHaveTextContent("Themed content")
  })
})
