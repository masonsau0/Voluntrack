# Voluntrack

Our capstone project! Voluntrack is a website that helps students find volunteer opportunities, track their hours, and get their volunteer work verified by schools and organizations.

## What it does

- Students can sign up, log in, and find volunteer opportunities near them
- There's a map so you can see where everything is
- You can log your hours and keep track of everything you've done
- Schools and organizations can post opportunities and verify student hours
- You can download a PDF of your hours when you need it (like for school requirements)
- Email notifications so you don't miss anything
- Some AI stuff using Google Gemini
- Looks nice on phones and computers, has dark mode

## Built with

- Next.js 15 and React 19
- TypeScript
- Tailwind CSS for styling
- Firebase for login and database stuff
- Google Maps
- Google Gemini for the AI features
- Resend for sending emails
- Jest for testing

## How to run it

You'll need Node.js installed first.

1. Clone the repo:

​```bash
git clone https://github.com/masonsau0/Voluntrack.git
cd Voluntrack
​```

2. Install everything:

​```bash
npm install
​```

3. Make a `.env.local` file in the main folder and put your keys in it:

​```
NEXT_PUBLIC_FIREBASE_API_KEY=your-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
GOOGLE_GENAI_API_KEY=your-gemini-key
RESEND_API_KEY=your-resend-key
​```

Check out `FIREBASE_SETUP.md` if you need help with the Firebase part.

4. Start it up:

​```bash
npm run dev
​```

## Folders

- `app/` — the pages
- `components/` — reusable pieces (buttons, forms, etc.)
- `contexts/` — stuff that's shared across the app (like login state)
- `hooks/` — custom React hooks
- `lib/` — Firebase setup and helper functions
- `public/` — images and static files
- `styles/` — CSS stuff
- `docs/` — documentation
- `__tests__/` — tests

## Testing

We use Jest for tests. Just run:

​```bash
npm test
​```

## Deploying

It's set up for Firebase Hosting. To deploy:

​```bash
npm run build
firebase deploy
​
