---
name: auth
description: Standardized way to protect Next.js routes and handle user authentication in Voluntrack using Firebase.
---

# Voluntrack Firebase Auth & Route Protection

When building new routes in Voluntrack that require authentication, always follow these standard patterns.

## 1. Firebase Auth Service Layer

All raw Firebase Auth and Firestore user profile interactions should go through `lib/firebase/auth.ts`.

- `signIn(email, password)` returns `User`
- `signUp(data)` returns `User` and creates their Firestore `users/{uid}` document.
- `signOutUser()`
- `getUserProfile(uid)` returns `UserProfile | null`
- `updateUserProfile(uid, data)`

## 2. Route Protection Strategy

If protecting an App Router page (e.g., `app/dashboard`), you should:

1. Access the authenticating context or use Firebase directly.
2. Use Next.js loading components (`loading.tsx`) or React Suspense to show skeletons or spinners while Firebase Auth initializes. This prevents flashing unauthenticated content to the user.
3. Once auth is resolved, if `!user`, immediately redirect to `/login` using Next.js `useRouter()` or `redirect()`.

## 3. Data Flow

1. Auth state changes trigger the user profile fetch (`getUserProfile`).
2. The user profile document contains business logic fields like `school`, `totalHours`, `badges`, etc.
3. Validate user roles or requirements based on this stored Firestore profile data rather than Auth tokens alone.
