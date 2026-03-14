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

### ⚠️ Critical: Always map every interface field explicitly

When building typed objects from Firestore `doc.data()`, **never rely on `as SomeType` alone**. TypeScript casts are compile-time only — fields omitted from the mapping silently become `undefined` at runtime, even though the type says they're a `string`.

```ts
// ❌ Wrong — orgId will be undefined at runtime despite Opportunity requiring it
opportunities.push({
  id: doc.id,
  title: data.title || "Untitled",
  // orgId never mapped → undefined
} as Opportunity);

// ✅ Correct — every field in the interface has an explicit mapping with a safe fallback
opportunities.push({
  id: doc.id,
  title: data.title || "Untitled",
  orgId: data.orgId || '',
} as Opportunity);
```

This applies to every fetch function (`getOpportunities`, `getAllOpportunities`, etc.). If you add a field to an interface, add it to every function that returns that type.

## 3. Writing Data (Mutations)

- Always track activity. Use `serverTimestamp()` from `firebase/firestore` for `createdAt` and `updatedAt` properties.
- Make mutations `async` and always wrap them in `try/catch`.
- Use `updateDoc` for partial updates to avoid overwriting unrelated fields instead of `setDoc` (unless establishing a new document).

### Stored Snapshots

Several collections store snapshots of another document's fields at the time of a write (e.g. `user_saved_opportunities` stores a copy of opportunity fields so the UI doesn't need to re-fetch). When writing a snapshot:

- Include **every field** the UI or downstream features depend on — missing fields cannot be added retroactively without a migration.
- The `SavedOpportunity` interface (in `lib/firebase/dashboard.ts`) requires `orgId` and `dateISO` in addition to display fields. These are needed for `applyToOpportunity()` to work from the `/applications` modal.
- `toggleSaveOpportunity()` — saves a snapshot on first save, deletes the document on re-save (toggle).
- `unsaveOpportunity(userId, opportunityId)` — direct delete, used by the unsave button in the `/applications` modal.

## 4. Security Rules

Security rules live in `firestore.rules` at the project root. After any change, deploy with:

```bash
firebase deploy --only firestore:rules
```

### ⚠️ Critical: Read rules and non-existent documents

Firestore security rules expose `resource` for the **existing** document. For documents that don't exist yet, `resource` is `null`. Any rule that accesses `resource.data.*` without a null guard will **deny** reads of non-existent documents, causing `getDoc()` calls to throw `"Missing or insufficient permissions"` even for authenticated users.

```js
// ❌ Wrong — denies reads when the document doesn't exist yet
allow read: if isAuthenticated()
  && resource.data.userId == request.auth.uid;

// ✅ Correct — allows checking for existence, then ownership
allow read: if isAuthenticated()
  && (resource == null || resource.data.userId == request.auth.uid);
```

This pattern is required on any collection where the app calls `getDoc()` to check existence before deciding to create or delete (e.g. `user_saved_opportunities`, `user_applications`).

## 5. Error Handling

- Catch errors in the service layer (e.g., `lib/firebase/opportunities.ts`), log them for debugging, and throw a standardized error so the UI layer can gracefully present a `sonner` toast to the user.
