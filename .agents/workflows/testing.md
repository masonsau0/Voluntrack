---
name: testing
description: Preferred setup for writing robust unit and component tests using Jest and React Testing Library in Voluntrack.
---

# Voluntrack Component Testing

This project uses Jest, React Testing Library, and User Event for robust frontend component tests.

## 1. Test File Location

- Place test files in a `__tests__/` directory adjacent to the file under test, or co-located as `[name].test.tsx`.
- Firebase service functions go in `lib/firebase/__tests__/[domain].test.ts`.
- Page integration tests go in `app/[route]/__tests__/page.test.tsx`.

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

## 4. Standard Mock Block for Page Tests

Every page test file needs this set of mocks to render without errors. Copy and trim as needed:

```tsx
jest.mock('@/lib/firebase/config', () => ({ auth: {}, db: {} }));
jest.mock('@/lib/firebase/dashboard', () => ({
  getUserApplications: jest.fn(),
  getUserSaved: jest.fn(),
  // ...add only what the page imports
}));
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    userProfile: { uid: 'user-123' },
    user: { uid: 'user-123' },
    loading: false,
  }),
}));
jest.mock('@/components/navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>{children}</button>
  ),
}));
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));
```

## 5. Querying Elements with Icons

Lucide React icons render as inline SVGs. A button containing `<Zap />Apply Now` has textContent `"Apply Now"` (SVGs add no text), but `getByText('Apply Now')` may fail if other elements on the page also contain "Apply Now" as a substring.

**Prefer `getByRole` for buttons** — it uses the accessible name and is unambiguous:

```ts
// ✅ Unambiguous — matches the button specifically
screen.getByRole('button', { name: /Apply Now/ })
screen.getByRole('button', { name: /Applied/ })

// ⚠️ Can throw if text appears in non-button elements too (e.g. filter labels)
screen.getByText(/Applied/)
```

When a text string appears in multiple places (sidebar label, modal title, filter heading), use `getAllByText` and assert on count, or use a role-scoped query.

## 6. UI Library (shadcn/ui) Specifics

- When testing Radix UI primitives included in `shadcn/ui` (like Dialogs or Selects), prioritize `userEvent` over `fireEvent` to accurately simulate complex internal pointer mapping.
- Be aware that certain Radix components render in React Portal document bodies, requiring broader `screen` queries or checks against `document.body`.
- Mock `@/components/ui/popover` and `@/components/ui/calendar` in page tests that import them, as they rely on Radix internals that don't work in jsdom:

```tsx
jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <>{children}</>,
  PopoverTrigger: ({ children }: any) => <>{children}</>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/components/ui/calendar', () => ({ Calendar: () => null }));
```
