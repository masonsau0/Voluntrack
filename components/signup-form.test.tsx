import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SignupForm } from "./signup-form"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/firebase/auth"

// Mock the dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/lib/firebase/auth", () => ({
  signUp: jest.fn(),
}))

describe("SignupForm", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it("redirects to /signup/preferences when signup succeeds", async () => {
    const user = userEvent.setup()
    ;(signUp as jest.Mock).mockResolvedValueOnce({ uid: "test-uid" })

    render(<SignupForm />)

    // Fill out the form
    await user.type(screen.getByLabelText(/First Name/i), "John")
    await user.type(screen.getByLabelText(/Last Name/i), "Doe")
    await user.type(screen.getByLabelText(/Email/i), "john@example.com")
    await user.type(screen.getByLabelText(/^Password/i), "Password123!")
    await user.type(screen.getByLabelText(/Confirm Password/i), "Password123!")

    // Submit
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "Password123!",
        firstName: "John",
        lastName: "Doe",
        role: "student",
      })
      expect(mockPush).toHaveBeenCalledWith("/signup/preferences")
    })
  })
})
