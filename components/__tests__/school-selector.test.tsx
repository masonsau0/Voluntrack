import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SchoolSelector } from "../school-selector"
import { getSchools } from "@/lib/firebase/schools"

jest.mock("@/lib/firebase/schools", () => ({
  getSchools: jest.fn(),
}))

const mockGetSchools = getSchools as jest.MockedFunction<typeof getSchools>

describe("SchoolSelector", () => {
  const mockSchools = [
    { schoolId: "1", name: "Central High", address: "123 Main St" },
    { schoolId: "2", name: "West Academy", address: "456 Oak Ave" },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetSchools.mockResolvedValue(mockSchools)
  })

  it("renders with placeholder when value is empty", () => {
    render(<SchoolSelector value="" onChange={jest.fn()} />)
    expect(screen.getByText("Search for your school...")).toBeInTheDocument()
  })

  it("renders disabled state with value only", () => {
    render(<SchoolSelector value="Central High" onChange={jest.fn()} disabled />)
    expect(screen.getByText("Central High")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /search/i })).not.toBeInTheDocument()
  })

  it("opens dropdown and shows loading then school list", async () => {
    const user = userEvent.setup()
    render(<SchoolSelector value="" onChange={jest.fn()} />)
    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type to search...")).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText("Central High")).toBeInTheDocument()
      expect(screen.getByText("West Academy")).toBeInTheDocument()
    })
  })

  it("calls onChange when a school is selected", async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<SchoolSelector value="" onChange={onChange} />)
    await user.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(screen.getByText("Central High")).toBeInTheDocument()
    })
    await user.click(screen.getByText("Central High"))
    expect(onChange).toHaveBeenCalledWith("Central High")
  })

  it("filters schools by search input", async () => {
    const user = userEvent.setup()
    render(<SchoolSelector value="" onChange={jest.fn()} />)
    await user.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type to search...")).toBeInTheDocument()
    })
    const input = screen.getByPlaceholderText("Type to search...")
    await user.type(input, "West")
    await waitFor(() => {
      expect(screen.getByText("West Academy")).toBeInTheDocument()
      expect(screen.queryByText("Central High")).not.toBeInTheDocument()
    })
  })

  it("shows No schools found when filter has no matches", async () => {
    const user = userEvent.setup()
    render(<SchoolSelector value="" onChange={jest.fn()} />)
    await user.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type to search...")).toBeInTheDocument()
    })
    await user.type(screen.getByPlaceholderText("Type to search..."), "Nonexistent")
    await waitFor(() => {
      expect(screen.getByText("No schools found")).toBeInTheDocument()
    })
  })
})
