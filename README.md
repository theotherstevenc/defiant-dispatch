# Defiant Dispatch

A browser-based HTML email editor and test-sending tool. Author emails in HTML, plaintext, and AMP for Email using a Monaco editor with live preview, manage project files in Firestore, upload `.eml` files, and send test emails via SMTP — all from one interface.

## Prerequisites

- **Node.js 22.x** / npm 10.x (client)
- **Node.js 24.x** (Cloud Functions — managed separately in `functions/`)
- **Java 11+** (required by the Firebase Emulator Suite)
- A **Gmail account** with an App Password (see [Email Setup](#email-setup) below)

> **Note:** `firebase-tools` is included as a local dev dependency — no global install needed. All `npm run` scripts use the local binary automatically. For one-off commands, use `npx firebase <command>`.

## Setup

### 1. Clone & Install

```bash
git clone <repo-url> && cd defiant-dispatch
npm install
cd functions && npm install && cd ..
```

### 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Create a **Firestore Database** (start in production mode or test mode — your choice).
4. Register a **Web App** under Project Settings → General → Your apps. Copy the config values.
5. Back in your terminal, log in and select your project:

```bash
npx firebase login
npx firebase use --add   # select your project
```

### 3. Environment Variables

Copy the example file and fill in your Firebase config values:

```bash
cp .env.example .env
```

| Variable                            | Where to find it                                     |
| ----------------------------------- | ---------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase Console → Project Settings → Your apps      |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Same location (e.g., `your-project.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID`          | Same location                                        |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Same location (e.g., `your-project.appspot.com`)     |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same location (numeric)                              |
| `VITE_FIREBASE_APP_ID`              | Same location                                        |

> These are safe to commit — they identify your project but don't grant access. Auth is handled by Firebase Authentication and Firestore Security Rules.

### 4. Firebase Secrets (Cloud Functions)

Three secrets are required for the Cloud Functions that handle email sending and password encryption:

```bash
npx firebase functions:secrets:set ENCRYPTION_KEY    # a random 32-char string for AES encryption
npx firebase functions:secrets:set MAIL_USERNAME      # your Gmail address
npx firebase functions:secrets:set MAIL_PASS          # your Gmail App Password (see below)
```

The CLI will prompt you for values interactively.

### 5. Email Setup

The send function uses SMTP via **nodemailer**. Gmail works out of the box, but requires an **App Password** — your regular Gmail password will not work.

**To generate a Gmail App Password:**

1. Go to [Google Account → Security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned on (required before App Passwords become available).
3. Go to [App Passwords](https://myaccount.google.com/apppasswords) (search "App Passwords" in the Google Account settings if the link doesn't work).
4. Enter a name for the app password (e.g., "Defiant Dispatch") and click **Create**.
5. Google will display a 16-character password. Copy it immediately — you won't be able to see it again.

Use this password as the `MAIL_PASS` value when running:

```bash
npx firebase functions:secrets:set MAIL_PASS
```

**Default SMTP settings** (used when no per-user overrides exist):

| Setting  | Default                    |
| -------- | -------------------------- |
| Host     | `smtp.gmail.com`           |
| Port     | `587` (TLS)                |
| Username | The `MAIL_USERNAME` secret |
| Password | The `MAIL_PASS` secret     |

**Non-Gmail SMTP** is also supported. Sender settings (host, port, username, password, from name) can be configured per-user from within the app's UI under the sender settings panel. Those SMTP credentials are AES-encrypted via the Cloud Function before being stored in Firestore, so they are never saved in plaintext.

> **Local development:** Email sending goes through the Cloud Functions emulator, which still makes real SMTP calls. If you need to test sends locally, you'll need valid SMTP credentials set as environment variables in a `functions/.env` file or passed through the app's sender settings UI.

## Running Locally

Start the Firebase Emulators and Vite dev server together:

```bash
npm run dev
```

This runs two processes concurrently:

- **Vite** dev server at `http://localhost:5173`
- **Firebase Emulators** — Auth (9099), Functions (5001), Firestore (8080), Emulator UI (4000)

Pre-seeded emulator data (auth accounts + Firestore docs) is automatically imported from `emulator-data/` and re-exported on exit.

> You can also run them separately with `npm run dev:frontend` and `npm run dev:emulators`.

### Create a Local User

Open the Emulator UI at `http://localhost:4000/auth` and add an email/password user, or use one of the pre-seeded accounts in `emulator-data/auth_export/accounts.json`.

## Scripts Reference

| Script                     | Purpose                               |
| -------------------------- | ------------------------------------- |
| `npm run dev`              | Start emulators + dev server          |
| `npm run build`            | TypeScript check + production build   |
| `npm run preview`          | Preview production build locally      |
| `npm run test`             | Run tests in watch mode               |
| `npm run test:coverage`    | Run tests with coverage report        |
| `npm run lint`             | Lint source files                     |
| `npm run lint:fix`         | Auto-fix lint issues                  |
| `npm run format`           | Format code with Prettier             |
| `npm run deploy`           | Build + deploy everything to Firebase |
| `npm run deploy:hosting`   | Build + deploy hosting only           |
| `npm run deploy:functions` | Deploy Cloud Functions only           |
| `npm run depcheck`         | Check for unused dependencies         |

## Deployment

```bash
npm run deploy
```

This builds the client, then deploys both hosting and Cloud Functions to Firebase. The app is served from Firebase Hosting with API routes (`/api/**`) proxied to the Cloud Function.

For partial deploys, use `npm run deploy:hosting` or `npm run deploy:functions`.

## Project Structure

```
src/                  → React client (Vite + TypeScript)
  components/         → UI components (editor, toolbar, dialogs)
  context/            → React contexts (Auth, EditorConfig, EmailSettings, Theme, Editor)
  services/           → Firestore service layer
  utils/              → Hooks, helpers, constants
functions/            → Firebase Cloud Functions (Express API)
  src/index.ts        → POST /send, POST /upload, POST /encrypt, GET /version
emulator-data/        → Pre-seeded data for local development
build/                → Production output (generated)
```

## Tech Stack

**Client:** React 19, MUI 7, Monaco Editor, Firebase SDK 12, Vite 7

**Server:** Express 5, Nodemailer 7, Mailparser 3, Firebase Functions 7

**Testing:** Vitest, Testing Library, V8 coverage
