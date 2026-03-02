---
name: firestore
description: Standardizes Firestore database interactions, fetching, and mutations in Voluntrack.
---

# Voluntrack Firestore Data Fetching & Mutations

When adding new features like opportunities, applications, or feed posts, follow these database rules.

## 1. Structure

- Place all custom Firebase logic in `lib/firebase/[domain].ts` (similar to `lib/firebase/auth.ts`).
- Avoid putting raw `getDocs`, `setDoc`, or `query` calls directly inside Next.js components or pages. Abstract them inside service functions.

## 2. Reading Data (Queries)

- Keep queries simple and structured.
- Import `db` from your centralized `lib/firebase/config.ts`.
- Return strongly typed interfaces (e.g., `export interface Opportunity { ... }`).
- For displaying lists (like the Feed or Opportunities page), implement standard paginated queries using `limit` and `startAfter` from `firebase/firestore` to keep document reads efficient.

## 3. Writing Data (Mutations)

- Always track activity. Use `serverTimestamp()` from `firebase/firestore` for `createdAt` and `updatedAt` properties.
- Make mutations `async` and always wrap them in `try/catch`.
- Use `updateDoc` for partial updates to avoid overwriting unrelated fields instead of `setDoc` (unless establishing a new document).

## 4. Error Handling

- Catch errors in the service layer (e.g., `lib/firebase/opportunities.ts`), log them for debugging, and throw a standardized error so the UI layer can gracefully present a `sonner` toast to the user.
