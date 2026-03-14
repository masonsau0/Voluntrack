# Voluntrack — Test Rigor Report

**Generated:** From token-efficient review (coverage run + checklist sample + structure scan).

---

## 1. Coverage snapshot (from `npm run test:coverage`)

| Area | Lines | Branches | Functions | Statements |
|------|-------|----------|-----------|------------|
| **lib** | 24% | 0% | 14% | 22% |
| **lib/firebase** | 37% | 48% | 25% | 38% |
| **components** | ~10% (many 0%) | — | — | — |

**Note:** `app/` and `app/api/` are not in `collectCoverageFrom`, so coverage only applies to `lib/` and `components/`.

---

## 2. Rigor checklist (sample: API, lib, components)

| Check | API (session, create-org) | Lib (opportunities, auth, reports) | Components (login-form, add-external-modal) |
|-------|---------------------------|-------------------------------------|---------------------------------------------|
| Happy path | Yes (200, body, cookies) | Yes (fetch, submit, signIn/signUp) | Yes (render, valid submit) |
| Errors / invalid input | Yes (400, 401, 403) | Yes (validation, auth errors, empty report) | Yes (validation errors, no submit) |
| Edge cases | Yes (missing token, wrong type) | Yes (pagination, empty list, null doc) | Partial (empty submit) |
| Assert on behavior | Yes (status, body, set-cookie, Firestore calls) | Yes (return values, mock call args) | Yes (toast, onSuccess, no call when invalid) |
| Mocks (no real I/O) | Yes (request/response only) | Yes (Firebase/firestore mocked) | Yes (auth, dashboard, sonner) |

**Verdict:** Sampled tests are rigorous (happy path, errors, edge cases, behavior assertions, mocks). Same patterns can be assumed for other tests in each category unless a file is known to be thin.

---

## 3. Tested vs not tested

### API routes (`app/api/`)

| Route | Tested | Notes |
|-------|--------|--------|
| `auth/session` (POST, DELETE) | Yes | Status, body, cookie flags (HttpOnly, SameSite, Max-Age). |
| `admin/create-org` (POST) | Yes | 401/403/400, 200, Firestore + Auth mocks, validation. |
| `seed` | **No** | No test file. |

### Lib (`lib/`)

| Module | Coverage | Notes |
|--------|----------|--------|
| firebase/admin.ts | 100% | Full. |
| firebase/reports.ts | 100% | Full. |
| firebase/auth.ts | ~52–58% | signIn, signUp, signOut, getUserProfile tested; some branches uncovered. |
| firebase/opportunities.ts | ~56–58% | getOpportunities tested; other paths partial. |
| firebase/dashboard.ts | ~39% | Partial; many branches uncovered. |
| firebase/student-profiles.ts | ~16–18% | Low. |
| firebase/org.ts | 0% | No tests. |
| firebase/schools.ts | 0% | No tests. |
| firebase/volunteer-org-profiles.ts | 0% | No tests. |
| firebase/config.ts | 0% | Config/init only. |
| applications-data.ts | 0% | No tests. |
| pdf-generator.ts | 0% | No tests. |
| preferences.ts | ~67–100% | Good. |
| ui-config.ts | ~89–100% | Good. |
| utils.ts | 100% | Good. |

### Components

| Component | Tested | Notes |
|-----------|--------|--------|
| login-form | Yes | Render, validation, signIn on valid submit. |
| signup-form | Yes | Similar. |
| role-guard | Yes | 100% coverage. |
| add-external-opportunity-modal | Yes | Render, validation, submit with mocks. |
| ProtectedRoute, RedirectIfAuthenticated | No | 0% coverage. |
| navigation, reflection-modal, school-selector, calendar-modal, notification-dropdown | No | 0% coverage. |
| components/ui/* | Mostly 0% | Covered indirectly by form/modal tests (button, input, form, etc.). |

### Other

| Item | Tested |
|------|--------|
| Middleware (`__tests__/middleware.test.ts`) | Yes |
| App pages (e.g. opportunities, org dashboard, org applicants) | Yes (page-level tests exist) |

---

## 4. Suggested next tests (by priority)

1. **High**
   - **`app/api/seed/route.ts`** — Add a test (e.g. `route.test.ts`) with mocks for any DB/API it uses; assert status and side effects.
   - **`lib/firebase/org.ts`** — Used for org data; add `__tests__/org.test.ts` (happy path + errors).
   - **`lib/firebase/schools.ts`** — Add `__tests__/schools.test.ts` if used in critical flows.
   - **`lib/firebase/volunteer-org-profiles.ts`** — Add tests if it writes or reads critical profile data.

2. **Medium**
   - **`lib/firebase/student-profiles.ts`** — Increase coverage (more branches/cases).
   - **`lib/firebase/dashboard.ts`** — Add or expand tests for uncovered branches (e.g. updateApplicationStatus, list paths).
   - **`lib/applications-data.ts`** — Add tests if used by multiple pages.
   - **Auth components:** `ProtectedRoute`, `RedirectIfAuthenticated` — One test each for allow/redirect behavior.

3. **Lower**
   - **`lib/pdf-generator.ts`** — Test when you change PDF generation (mock jspdf).
   - **components:** reflection-modal, school-selector, calendar-modal — Add tests when you touch them or need regression safety.

---

## 5. Config change applied

- **Coverage thresholds** were added in `jest.config.js` with a low bar so CI fails if coverage drops significantly, without forcing a large test expansion now. Adjust or raise thresholds as you add the suggested tests.

---

## 6. How to re-run this review

1. Run: `npm run test:coverage`
2. Open `coverage/lcov-report/index.html` (or use terminal summary).
3. Re-apply the rigor checklist to 2–3 tests per category if you add new test types.
4. Update this report when you add tests for seed, org, schools, or volunteer-org-profiles.
