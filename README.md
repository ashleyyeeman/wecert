# WeCert

WeCert now includes a real account-based classroom for students and teachers, while retaining the existing green/mint design, course content and English / Traditional Chinese / Simplified Chinese interface.

The homepage offers **Student edition** and **Teacher edition**. The online classroom is hosted at https://wecert-wheat.vercel.app/; the GitHub Pages entry redirects there so authentication cookies and API requests stay on the same origin.

## Student and teacher features

- Students register and sign in with email and a password of at least 12 characters. Learning plans, course progress, assessment profiles, questions and feedback persist across devices.
- Teachers can inspect actual learner progress, reply to questions, publish/edit/archive course announcements, write lesson guidance, keep private teaching notes and create single-use teacher invitation links.
- Student registration always creates a student. A URL choice, browser state or request body cannot grant teacher access. Every teacher API checks the authenticated account's database role.
- Student questions and replies are scoped to that student's account. Private notes are scoped to the teacher who wrote them and are never returned by student APIs.
- Notes, announcements and responses refresh on navigation and while an idle workspace is open. Unsaved form text is preserved during language changes and background refreshes.

## Teacher demonstration

Open https://wecert-wheat.vercel.app/?demo=teacher#teacher for the public teacher demonstration, with no account required. Links are available on the homepage and teacher sign-in page. It includes fictional learners, sample questions, local replies, announcements and lesson guidance, plus a student preview.

Demo records use their own browser storage key. The demo does not load account sessions or call classroom APIs, even when a real account is signed in in another tab. Resetting it clears only these demo records. The banner identifies the demonstration and links back to the live teacher sign-in; actual teaching records continue to require server-authorised teacher access.

## Authentication and data

The backend uses Hono, Better Auth and Neon Postgres. Sessions use HttpOnly cookies, with Secure cookies on HTTPS. Better Auth handles password hashing and authentication rate limits. Application mutations check their origin, validate inputs and use parameterised SQL. Learner-state writes use revision checks; authoritative quiz results and teaching records cannot be supplied through the learner-state API.

Production uses the `public` database schema and a pooled connection. Development uses `wecert_dev` and the unpooled Neon connection so its startup `search_path` stays separate from production. The optional Neon Auth variables created by the integration are not used; Better Auth owns this application's authentication tables.

The first teacher is activated with a private, single-use setup link delivered separately to the project owner. It is not committed to this repository. Subsequent teachers join through authenticated teachers' invitations, which expire after three days and cannot be reused. No teacher passwords or shared default accounts are shipped.

## Development

Use Node 24+, Python 3 and npm.

```sh
npm ci
```

Link the existing Vercel project and pull **Development** variables into the ignored `.env.local` file. The variables are listed in `.env.example`; never commit actual values. Set `APP_ORIGIN=http://localhost:3000` and `DATABASE_SCHEMA=wecert_dev`. A pulled `DATABASE_URL_UNPOOLED` is preferred for this isolated development schema.

After configuration is present:

```sh
npm run db:migrate
node scripts/build-public.cjs
npm run dev
```

Open http://localhost:3000. `npm run build` prepares the public files and runs idempotent database migrations using the deployment's own environment. Server code, `.env` files, tests and source-control metadata are excluded from the public asset directory.

For frontend-only work, `npm start` serves the root at port 8000. Without an API it runs an explicitly labelled local demonstration with fictional classmates. That mode is not used by the hosted classroom. Existing browser-only demo data is retained locally and is not silently attached to a new real account or uploaded as real learner records.

## Verification

```sh
npm test
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

The browser suite covers the original learner flows, all three languages, homepage role entries and teacher layouts at 320, 390, 768 and 1440 pixels.

With the local server running and the isolated `wecert_dev` schema configured:

```sh
npm run test:classroom
```

This real-database flow uses independent browser contexts for a teacher, a student, another student and a second device. It checks role escalation rejection, owner setup, cross-device progress and replies, course-scoped announcements, archiving, guidance, private notes, one-time invitations and sign-out. It refuses to run against the production schema and cleans up its generated fixture accounts. Credentials and invitation tokens are not printed.

## File map

| Files | Purpose |
| --- | --- |
| `server.mjs`, `backend/` | Authentication, authorised APIs, validation and database schema |
| `remote.js` | Account UI, sync state and remote API integration |
| `teacher-data.js`, `teacher-views.js`, `teacher-actions.js` | Teacher management and offline demonstration |
| `course-data.js`, `assessment.js` | Shared course catalogue, curricula and recommendation logic |
| `storage.js` | Existing offline data migration |
| `assessment-views.js`, `learning-views.js`, `information-views.js`, `app.js` | Learner pages, public information and routing |
| `i18n.js`, `translations.js`, `locales/zh-Hant.tsv` | Interface translation and language preference |
| `IMPROVEMENT-AUDIT.md` | Original recommendations and completion history |

## Remaining service limits

The representative spreadsheet, office and introductory Japanese courses are classroom content; other courses remain previews. No payment, real appointment, employer referral, subsidy or formal qualification is provided. Income records and financial assumptions remain illustrative. The sample tutor gives scripted lesson guidance, not live AI. Account email verification and email-based password recovery are not configured; signed-in users can change their password and revoke other sessions. Those email workflows require a mail-delivery service before broad public enrolment.

## Translation updates

Edit `locales/zh-Hant.tsv`, then run `python scripts/build-locales.py` with the development-only `opencc-python-reimplemented` package installed. The generated `translations.js` is checked in; there is no runtime translation service. User-entered names, questions, replies and announcements are preserved exactly. Japanese examples and spreadsheet formulas retain their original wording where needed.
