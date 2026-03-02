---
name: testing
description: Preferred setup for writing robust unit and component tests using Jest and React Testing Library in Voluntrack.
---

# Voluntrack Component Testing

This project uses Jest, React Testing Library, and User Event for robust frontend component tests.

## 1. Test File Location

- Place test files adjacent to the components they test, generally named `[ComponentName].test.tsx`.

## 2. Mocking Dependencies

Next.js App Router and Firebase can be tricky to test. Always mock external providers:

- **Next.js Navigation:** Mock `useRouter`, `usePathname`, and `useSearchParams` from `next/navigation` to avoid Next.js context errors.
- **Firebase:** Intercept your own `lib/firebase/auth.ts` exports rather than trying to initialize Firebase directly in test suites. Test logic, not live Firebase Auth connectivity.

## 3. Writing the Test

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly and responds to clicks", async () => {
    // Setup for full user event simulation
    const user = userEvent.setup();
    render(<MyComponent />);

    // 1. Assert initial state
    expect(screen.getByText("Hello")).toBeInTheDocument();

    // 2. Simulate user action comprehensively
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // 3. Assert resulting UI side effect
    expect(screen.getByText("Submitted!")).toBeInTheDocument();
  });
});
```

## 4. UI Library (shadcn/ui) Specifics

- When testing Radix UI primitives included in `shadcn/ui` (like Dialogs or Selects), prioritize `userEvent` over `fireEvent` to accurately simulate complex internal pointer mapping.
- Be aware that certain Radix components render in React Portal document bodies, requiring broader `screen` queries or checks against `document.body`.
