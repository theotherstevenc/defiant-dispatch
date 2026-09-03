# Copilot Instructions

## Guiding principle

Favor "boring" code. Prefer explicit, flat, readable control flow and clear interfaces over clever abstractions. Introduce architectural complexity only when the existing component, context, service, and util patterns cannot solve the problem clearly.

## Runtime and dependency boundaries

- The client uses Node.js 22.x / npm 10.x as declared in the root `package.json` `engines` field. Cloud Functions declare Node.js 24 in `functions/package.json`.
- Java 11+ is required by the Firebase Emulator Suite.
- Install the root package and Cloud Functions separately; they are independent packages with their own lockfiles:

  ```bash
  npm install
  npm install --prefix functions
  ```

- This is not an npm workspace. The root package owns `src/` and the root `package-lock.json`; `functions/` is an independent Firebase deployment package.
- Do not install CLI tools globally. `firebase-tools` is a root devDependency — use `npm run` scripts or `npx firebase <command>`.
- Never edit or commit generated `functions/lib/` output. Change `functions/src/` and rebuild.

## Build, test, lint, and local development

Run commands from the repository root unless noted:

```bash
npm run dev                          # Firebase emulators plus Vite, via concurrently
npm run build                        # tsc -b then vite build, output to build/
npm run build --prefix functions     # compile Cloud Functions to functions/lib
npm run lint                         # ESLint across src/**/*.{ts,tsx}
npm run lint:fix                     # ESLint with --fix
npm run lint --prefix functions      # type-check only (tsc --noEmit), not ESLint
npm run format:check                 # Prettier check
npm run format                       # Prettier write
npm test                             # Vitest in watch mode; use `npx vitest run` for CI/one-off
npm run test:coverage                # Vitest single run with v8 coverage
npm run depcheck                     # find unused/missing dependencies
```

Run one test file (use `vitest run`, since the `test` script defaults to watch mode):

```bash
npx vitest run src/utils/__tests__/encryptString.test.ts
```

Local development details:

- `npm run dev` runs `dev:emulators` and `dev:frontend` concurrently. Emulators start with `--import=./emulator-data --export-on-exit`, so local Auth and Firestore state persists between runs.
- Emulator ports: Auth 9099, Functions 5001, Firestore 8080, Emulator UI enabled, `singleProjectMode` on.
- `src/firebase.ts` connects to all three emulators when `import.meta.env.DEV` is true. There is no separate opt-in flag — dev mode always means emulators.
- The Vite dev server proxies `/api` to `http://localhost:5001` and rewrites the path to the emulator function route. In production, Firebase Hosting rewrites `/api/**` to the `api` function. Client code should always call the bare `/api/...` path so both environments work.
- Deployment runs `npm run build` first for hosting. `firebase.json` `predeploy` runs the functions type-check and build before deploying functions.

## Architecture

This is a single-page React client backed only by Firebase:

- `src/` is React 19 + TypeScript + Vite 7 + MUI 7, with Monaco (`@monaco-editor/react`) as the code editor and `react-split` for resizable panes. There is no client router.
- `functions/` is a single Express 5 app exported as one HTTP function, `api`, from `functions/src/index.ts`. Routes are `/encrypt`, `/send`, `/upload`, and `/version`.
- Application state lives in five context providers. `src/main.tsx` nests `AuthProvider` → `EditorConfigProvider` → `EmailSettingsProvider` → `ThemeSettingsProvider`, and `App.tsx` adds `EditorProvider` inside those. Provider order matters: `EditorConfigContext` consumes `useAuthContext`.
- The browser talks to Firestore directly using the modular `firebase/firestore` SDK. Working-file reads and writes go through `src/services/workingFilesService.ts`; editor settings are a live `onSnapshot` listener on the `config/editorSettings` document in `EditorConfigContext`.
- Data logic belongs in `src/services/`. Components should call service functions rather than constructing Firestore refs inline. `src/utils/updateFirestoreDoc.ts` is the generic merge-write helper.
- Firestore listeners return unsubscribe functions. Always clean them up in the `useEffect` return.
- Only work that needs a server belongs in Cloud Functions: SMTP sending, AES encryption with the `ENCRYPTION_KEY` secret, and `.eml` parsing. Everything else stays client-side.
- Adding an endpoint means adding the Express route in `functions/src/index.ts` and calling the matching `/api/...` path from the client. Because Hosting already rewrites `/api/**` to the single `api` function, no `firebase.json` change is needed for a new route under `/api`.
- No `firestore.rules` file is tracked in this repository and `firebase.json` does not configure a rules deploy, so Firestore security rules are managed outside the repo. Any change to how the browser reads or writes a collection needs the corresponding rules reviewed in the Firebase Console.

## Cloud Functions conventions

- Body parsers are applied **per-route**, never globally. Firebase Functions v2 pre-consumes the request stream, so a global `express.json()` would break the `/upload` handler. Keep `jsonParser`/`urlencodedParser` as explicit per-route middleware.
- `/upload` parses multipart data with Busboy and prefers `req.rawBody` when present, falling back to piping the request. Do not replace this with a body-parsing middleware.
- Middleware strips a leading `/api` prefix from `req.url` so the same route strings match in production Hosting and the local emulator.
- CORS uses an explicit allowlist of the two Firebase Hosting domains plus local dev origins. New origins must be added to `allowedOrigins`.
- Validate input at the top of each handler and return `400` with a JSON `{ error }` body. Log unexpected failures with `console.error` and return `500` with a generic message — never leak internal error details to the client.
- Secrets are Firebase Function secrets declared with `defineSecret` (`ENCRYPTION_KEY`, `MAIL_USERNAME`, `MAIL_PASS`) and passed via the `secrets` option on `onRequest`. Read them with `.value()` inside handlers, never at module scope. Non-secret mail defaults come from `process.env`. Never commit `functions/.env` values that contain credentials.
- Functions use NodeNext ESM. Relative TypeScript imports must include the `.js` extension.

## Repository-specific conventions

- User-facing strings, storage keys, and Firestore paths are centralized in `src/utils/constants.ts` as `UPPER_SNAKE_CASE` exports. Add new labels and collection/document names there rather than inlining literals.
- Shared object shapes live in `src/interfaces/index.ts`, including the `*ContextProps` interfaces for every context. Keep context value types there, not in the provider file.
- Components are default-exported from their own file and re-exported by name from `src/components/index.ts`. Add new components to that barrel.
- Tests are Vitest with React Testing Library and jsdom, located in `__tests__/` folders beside the code (`src/components/__tests__/`, `src/utils/__tests__/`). Vitest only picks up `src/**/*.test.ts(x)`.
- Errors go through `src/utils/logError.ts`, which logs details only in development and a generic message otherwise. Do not call `console.error` directly in client code, and never swallow an error silently. Note that the production build drops `console` calls via Terser.
- Persisted UI preferences use `usePersistentValue` with a key from `constants.ts`; shared editor settings persist to Firestore instead of `localStorage`.
- Prettier config is authoritative: no semicolons, single quotes (including JSX), `printWidth` 150, 2-space indent, ES5 trailing commas, `bracketSameLine`. Do not hand-format against these.
- ESLint enforces `import/order` with `newlines-between: always` and case-insensitive alphabetical ordering within each group. Imports use relative paths — there is no path alias configured.
- Contexts export a provider plus a `use*Context` hook that throws when used outside the provider. The `react-refresh/only-export-components` rule is disabled at the top of context files for this reason.
- MUI theming comes from `src/styles/global.theme.ts` and `src/styles/global.styles.ts`. Pull colors and shared styling from there rather than hardcoding values in components.
- Interactive elements need an accessible name. `StyledIconButton` and the icon-only controls rely on explicit `aria-label`/`title` text sourced from `constants.ts` — keep that pattern for new controls.
- The Vite build defines `__APP_VERSION__` from `package.json` and stamps the version into asset filenames, and the `/version` endpoint reports the functions package version. Version changes belong to the root package via `npm run patch`, followed by `npm run tag`.

## Maintenance priorities

- Recent history is predominantly dependency and fix work. Prefer low-risk maintenance and targeted fixes over speculative refactors, and follow the existing Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
- Patch dependencies conservatively and review audit findings before changing versions. Keep the root and `functions/` dependency boundaries distinct, and do not run `npm audit fix --force` blindly.
- Changes touching SMTP credentials, the encryption key, Firebase configuration, or deployment settings require explicit review of secret scope and deployment impact. Never commit `.env` files or credentials.
- `VITE_FIREBASE_*` values in `.env` identify the project and are not access grants, but access control still depends on Firebase Authentication and Firestore rules — treat rules changes as security-sensitive.
