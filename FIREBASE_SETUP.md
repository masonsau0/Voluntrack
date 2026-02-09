# Firebase Setup Guide

This guide will help you set up Firebase Authentication and Firestore for your Voluntrack project.

## Prerequisites

- A Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Firebase Authentication enabled with Email/Password provider
- Firestore Database created

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### How to Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click "Add app" and select the web icon (</>)
7. Copy the config values from the `firebaseConfig` object

## Firestore Security Rules

Make sure your Firestore security rules match the rules provided. The rules are configured in the Firebase Console under Firestore Database > Rules.

The rules ensure:
- Users can only create/update their own profile (document ID must match Auth UID)
- Authenticated users can read other user profiles
- Public read access for schools, volunteer organizations, and opportunities
- Authenticated users can create and manage opportunities and enrollments

## Testing

Run the test suite to verify everything is working:

```bash
# Install dependencies (if not already installed)
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Features Implemented

### Authentication
- ✅ User login with email and password
- ✅ User signup with email, password, full name, and school
- ✅ Automatic user profile creation in Firestore on signup
- ✅ Error handling with user-friendly messages
- ✅ Loading states during authentication

### Firestore Integration
- ✅ User profiles stored in `users` collection
- ✅ Document ID matches Firebase Auth UID (required by security rules)
- ✅ Timestamps for `createdAt` and `updatedAt`

## Next Steps

After setting up Firebase:
1. Add your Firebase config to `.env.local`
2. Test login and signup functionality
3. Verify user documents are created in Firestore
4. Run the test suite to ensure everything works

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Make sure your `.env.local` file has the correct `NEXT_PUBLIC_FIREBASE_API_KEY`
- Restart your development server after adding environment variables

### "Firebase: Error (auth/operation-not-allowed)"
- Enable Email/Password authentication in Firebase Console
- Go to Authentication > Sign-in method > Email/Password > Enable

### "Permission denied" errors in Firestore
- Check that your Firestore security rules are deployed
- Verify the rules match the provided rules in the project documentation
