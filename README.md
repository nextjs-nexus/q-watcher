# Q-Watcher

Discover movies and TV shows, keep track of what you want to watch, and rate what you have seen. Q-Watcher combines TMDB's catalog with personal **To Watch** and **Watched** lists stored in MariaDB.

Built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS 4**.

## Features

- **Movie and TV discovery:** browse top-rated titles, switch between movies, TV shows, or both, and filter by genre.
- **Search:** find titles with debounced search and URL-based filters.
- **Personal lists:** save titles to To Watch and Watched, then search and filter your saved collection.
- **Personal ratings:** assign or clear an integer rating from 1 to 10, displayed alongside TMDB's community score.
- **Title details:** view posters, backdrops, overviews, genres, release dates, runtimes, and community ratings. TV pages display episode runtime when available.
- **Trailers:** open YouTube trailers from thumbnail links, with official trailers shown first. Missing trailers do not prevent a detail page from loading.
- **Continuous browsing:** load additional results automatically as you scroll, and restore loaded titles and scroll position when returning from a detail page.
- **Accounts:** sign up, verify an email address, sign in, sign out, resend verification emails, and reset a forgotten password.
- **Responsive interface:** a dark theme, adaptive poster grid, optimized images, and Lucide icons.

The landing page and account flows are public. Browsing and title-detail routes require a session cookie. Shared title URLs also require the recipient to sign in.

## Technical stack

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16 App Router with file-based routes, layouts, route groups, and dynamic movie/TV pages |
| Language | TypeScript 5 with strict type checking and the `@/*` import alias |
| UI | React 19, Tailwind CSS 4, Lucide React, and Inter through `next/font` |
| Rendering | Async Server Components for initial catalog and detail-page data; Client Components for forms, filters, infinite scrolling, and preference controls |
| Server Actions | Authentication actions, paginated catalog loading, preference refreshes, and watchlist/rating updates |
| Database | MariaDB through a shared `mysql2` connection pool; parameterized SQL for application queries |
| Authentication | Better Auth with database-backed accounts and sessions, using Kysely's MySQL dialect |
| External API | TMDB REST API v3 for discovery, search, title details, and trailer metadata |
| Authentication API | Next.js Route Handler exposing Better Auth's GET and POST endpoints at `/api/auth/[...all]` |
| Request routing | Next.js `proxy.ts` for session-cookie checks and authentication redirects |
| Email | Nodemailer over SMTP for verification and password-reset messages |
| Tooling | ESLint 9, Node.js test runner, and `tsx` for TypeScript tests and database scripts |

### How data flows

1. Server Components fetch catalog or title data from TMDB and read the current user's saved preferences from MariaDB.
2. Client Components handle interactions and call Server Actions to load more titles or save changes.
3. Preference writes validate the Better Auth session, media identifier, media type, and rating before updating the database. Successful writes revalidate the list and relevant detail page.
4. TMDB fetches use a one-hour revalidation interval. User preferences are read separately from the catalog data.

`proxy.ts` checks whether `better-auth.session_token` or its HTTPS-prefixed `__Secure-better-auth.session_token` variant is present and redirects unauthenticated requests to `/signin`. It also redirects requests to `/signin` with that cookie to `/list`. This is a routing check; preference writes perform a separate server-side session validation. It does not forward requests to TMDB or act as an external API proxy.

Catalog operations use Server Actions and shared server-side helpers. The app's HTTP API route is the Better Auth handler; it does not expose a separate public movie REST API.

## Getting started

### Prerequisites

- Node.js and npm compatible with the Next.js version in `package.json`.
- A running MariaDB server and an existing database, such as `q_watcher`.
- A TMDB API key.
- SMTP credentials for account verification and password-reset emails.

### 1. Install dependencies

Clone the repository, open its directory, and run:

```sh
npm install
```

### 2. Configure the environment

Copy `.env.example` to `.env.local`:

```sh
# Linux / macOS / WSL
cp .env.example .env.local
```

```powershell
# PowerShell
Copy-Item .env.example .env.local
```

Replace the placeholders with your own values:

```dotenv
DATABASE_URL=mysql://local-user:your-password@127.0.0.1:3306/q_watcher
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key

BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=notifications@example.com
SMTP_PASSWORD="your-mailbox-password"
SMTP_FROM_EMAIL="Q-Watcher <notifications@example.com>"
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Server-only MariaDB connection URL. URL-encode special characters in connection credentials. |
| `NEXT_PUBLIC_TMDB_API_KEY` | TMDB API key used by the catalog fetch helper. The existing name uses the public prefix, so do not treat it as a server-only secret. |
| `BETTER_AUTH_URL` | Base URL for authentication. Set it to the actual application origin and port. |
| `BETTER_AUTH_SECRET` | A long, randomly generated authentication secret. |
| `NEXT_PUBLIC_APP_URL` | Application URL used by client-side authentication requests. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP server and transport settings. |
| `SMTP_USER`, `SMTP_PASSWORD` | Server-only SMTP credentials. |
| `SMTP_FROM_EMAIL` | Sender address, optionally including a display name. |

Use port **465** with `SMTP_SECURE=true` for implicit TLS. If your provider specifies STARTTLS, use port **587** with `SMTP_SECURE=false`; the app requires the TLS upgrade and validates certificates.

The current code does not use `NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN`, `RESEND_API_KEY`, or `RESEND_FROM_EMAIL`, even though they appear in `.env.example`. Authentication emails use SMTP.

Keep `.env.local` private. Database credentials, SMTP credentials, and the authentication secret belong only in server-side environment variables. Restart the development server after changing configuration.

### 3. Create the database tables

Create the database in MariaDB first, then run:

```sh
npm run db:migrate
```

The SQL migrations create missing tables without deleting existing data:

- `user`, `session`, `account`, and `verification` for Better Auth.
- `user_media_preferences` for per-user watch statuses, ratings, and basic title metadata.

Preferences are keyed by user, TMDB title ID, and media type, so a movie and a TV show with the same TMDB ID remain distinct. Foreign keys remove a user's preferences when that user is deleted.

### 4. Start the app

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000), create an account, and follow the verification email before signing in.

For a local account that is already verified, optionally add `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` to `.env.local`, then run:

```sh
npm run db:seed
```

The seed script preserves existing users. Use the same password requirements as the sign-up form: 10–128 characters, including uppercase and lowercase letters, a number, and a special character.

## Authentication and email

New accounts must verify their email before signing in. Existing unverified accounts can request another link at `/verify-email`. Forgotten-password requests start at `/forgot-password`, and reset links open `/reset-password`.

Authentication emails describe a one-hour link lifetime. Password resets revoke existing sessions. Password validation runs in the sign-up Server Action and Better Auth hooks for sign-up and password changes.

To check delivery, register with an inbox you control, verify the account, request a password reset, and confirm the new password works. Check spam folders as well: SMTP acceptance does not guarantee inbox delivery. Localhost links must be opened on the computer running the app.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/list` | Catalog, search, genre/type filters, and personal lists |
| `/movie/[id]` | Movie details, trailers, watch statuses, and personal rating |
| `/tv/[id]` | TV details, trailers, watch statuses, and personal rating |
| `/signup`, `/signin` | Account registration and sign-in |
| `/login` | Redirect to `/signin` |
| `/verify-email` | Request another verification email |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/api/auth/[...all]` | Better Auth API endpoints |

List state is represented by `query`, `genre`, `type`, and `status` query parameters. Media types use `0` for both, `1` for movies, and `2` for TV; statuses use `all`, `toWatch`, and `watched`. Loaded results and scroll position are cached in browser session storage, with an in-memory fallback.

Genre filtering applies to discovery and saved lists. Catalog text searches use TMDB's search endpoints and take precedence over the genre selection. The shared genre selector maps Action and Science Fiction to TMDB's corresponding TV categories; TV Horror filtering returns no titles because the implementation has no matching TV category.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the automated tests; database integration checks are skipped by default |
| `npm run db:migrate` | Create missing database tables |
| `npm run db:seed` | Create an optional verified local user |

Tests cover browsing-state restoration, TMDB request behavior and trailers, password validation, email handling, proxy redirects, and optional database integration.

To include the MariaDB integration check on Linux or WSL:

```sh
RUN_DATABASE_TESTS=1 npm test
```

In PowerShell:

```powershell
$env:RUN_DATABASE_TESTS = "1"
npm test
Remove-Item Env:RUN_DATABASE_TESTS
```

The integration check needs a migrated database and an existing verified user. Test database writes run in a transaction and are rolled back.

## Project structure

```text
app/                  App Router pages, layouts, and authentication API handler
  (authentication)/   Registration, verification, and password-recovery pages
  list/               Catalog and personal-list page
  movie/[id]/         Movie detail page
  tv/[id]/            TV detail page
actions/              Authentication, catalog, and preference Server Actions
components/           Shared UI and interactive controls
db/migrations/        MariaDB schema migrations
lib/                  TMDB, authentication, database, email, and browsing helpers
tests/                Unit tests and optional MariaDB integration check
proxy.ts              Session-cookie routing and redirects
```

## Production setup

Configure the same environment variables for your deployment, use your public origin for both application URLs, and make MariaDB and SMTP reachable from the server. Set public environment variables before building, since Next.js can embed them into client bundles.

Run migrations against the target database, then build and start:

```sh
npm run db:migrate
npm run build
npm start
```

The app requires a server runtime for authentication, Server Actions, SMTP, and database access. It cannot be deployed as a static-only export.

The sitemap uses `NEXT_PUBLIC_APP_URL` as its base URL. Set it to your public HTTPS origin before building for production.

## Data sources

Movie and TV metadata and artwork come from TMDB. Trailer thumbnails come from YouTube, and trailer links open YouTube in a new tab. Personal watch statuses and ratings are stored separately in the application's MariaDB database.


