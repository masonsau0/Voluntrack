import React from "react"
import { render, screen } from "@testing-library/react"
import { Footer } from "../footer"

describe("Footer", () => {
  it("renders brand name VolunTrack Ontario", () => {
    render(<Footer />)
    const footer = screen.getByRole("contentinfo")
    expect(footer).toHaveTextContent("Volun")
    expect(footer).toHaveTextContent("Track")
    expect(footer).toHaveTextContent("Ontario")
  })

  it("renders tagline about connecting Ontario students", () => {
    render(<Footer />)
    expect(screen.getByText(/Connecting Ontario students with meaningful volunteer opportunities/)).toBeInTheDocument()
  })

  it("renders About section with Our Story, Sustainability, Contact links", () => {
    render(<Footer />)
    expect(screen.getByRole("link", { name: /Our Story/i })).toHaveAttribute("href", "/about")
    expect(screen.getByRole("link", { name: /Sustainability/i })).toHaveAttribute("href", "/about#sustainability")
    expect(screen.getByRole("link", { name: /Contact/i })).toHaveAttribute("href", "/contact")
  })

  it("renders copyright with current year", () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument()
  })

  it("renders Privacy Policy and Terms of Service links", () => {
    render(<Footer />)
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toHaveAttribute("href", "/privacy")
    expect(screen.getByRole("link", { name: /Terms of Service/i })).toHaveAttribute("href", "/terms")
  })

  it("uses footer landmark", () => {
    render(<Footer />)
    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
  })
})
