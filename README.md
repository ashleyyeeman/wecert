# WeCert

A classroom prototype with English, Traditional Chinese and Simplified Chinese interfaces of affordable vocational training and career support for Hong Kong learners. The WeCert name and original deep green / mint visual style are retained. Use the **繁**, **简** and **ENG** buttons to switch languages; the selected language is remembered in this browser. Switching preserves unfinished forms, questions and open-dialog answers.

See [the original recommendation audit](IMPROVEMENT-AUDIT.md) for a point-by-point completion record and the separate operational-backend roadmap.

## Try the demo

Serve this directory with `python3 -m http.server 8000`, then open http://localhost:8000. There is no build step or runtime package dependency. GitHub Pages can serve the repository root directly.

- **Assessment:** profile → skills and goal → four goal-specific scenarios → evidence and an explained learning path. Budget, study format, weekly hours, all required timetable slots and prerequisites constrain matches. Hybrid courses requiring evening and weekend attendance must fit both; learners can select additional available times. Education and experience inform support suggestions, not eligibility for beginner courses.
- **Complete representative routes:** Spreadsheet Essentials (10 lessons), Basic Office Digital Literacy (3 lessons) and introductory Japanese (3 lessons). Each has its own guide, practice, three-question knowledge check, checklist and saved progress. Other courses are explicitly previews.
- **Shareable lessons:** `#lesson/japanese/2` identifies the course and lesson. Old numeric `#lesson/7` links deterministically open the original spreadsheet course. Invalid lessons show a recovery page.
- **Career dashboard:** next action, personal pathway, course switching, sample career support, course-specific placement eligibility and illustrative income/employment follow-ups at 3, 6 and 12 months. Zero baseline income has no percentage IIAE.
- **Free resources:** accessible without enrolment or budget; funding enquiries are local examples only.
- **About / Project Proposal:** learner information is separated from original financial assumptions. Course fees are total fees, while the HK$2,000 monthly customer revenue assumption is clearly unvalidated. Forecasts are not actual results.

## Files

| File | Purpose |
| --- | --- |
| `i18n.js` / `translations.js` | In-place UI translation, language persistence and static catalogues |
| `locales/zh-Hant.tsv` | Translation source; Simplified Chinese is generated with OpenCC |
| `course-data.js` | Course catalogue, schedules, curricula, knowledge checks |
| `assessment.js` | Scenario questions, evidence and matching rules |
| `storage.js` | Defaults and migration from the original browser data |
| `assessment-views.js` | Assessment forms and results |
| `learning-views.js` | Dashboard, lessons and impact records |
| `information-views.js` | About, free resources and proposal |
| `app.js` | Shared UI helpers, catalogue, routing and events |
| `style.css` | Original palette with responsive and touch improvements |

## Verification

Use Node 22+ and Python 3:

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

To use an existing Chromium installation:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

The tests cover hard matching constraints, prerequisite evidence, old-data migration, Japanese/spreadsheet isolation, course deep links, completed office-course placement eligibility, zero-budget resources, persisted income follow-ups and mobile overflow. Language tests cover the exact button labels, remembered preferences, Traditional/Simplified Chinese course search, canonical form values, multilingual assessment and quiz submission, unchanged user content and layouts at 320, 390, 768 and 1440 pixels. Screenshots and reports are ignored by Git.

## Prototype limits and operational roadmap

All user-entered data stays in this browser under the original storage key, `skillbridge-hk-demo-v1`. Existing course progress is retained; old global exam and quiz values migrate to spreadsheets only. An old profile-only assessment must complete the new scenarios before it is marked assessed. Use Demo privacy → Reset demo data to clear local records.

No account, payment, staff message, real appointment, formal qualification, subsidy or job placement is created. Tutor replies are scripted from the current lesson; they are not live AI. Course dates, prices, venues, learner journeys and impact records are illustrative. The Japanese text route is not a listening assessment or a full JLPT preparation course.

Before serving real learners: validate curricula and qualification claims; confirm partners, funding and service arrangements; implement authenticated cross-device storage, teacher administration and real bookings; add reviewed course-grounded AI; and validate the multilingual interface with learners. The interface now supports English, Traditional Chinese and Simplified Chinese as requested. Course teaching language is separate from interface language. Before real service delivery, validate the translations with learners and instructors.

## Updating translations

Edit the tab-separated English → Traditional Chinese messages in `locales/zh-Hant.tsv`. Generate both browser catalogues with `python scripts/build-locales.py` after installing the development-only `opencc-python-reimplemented` package. `translations.js` is checked in, so no Python package or translation service is required to serve the site.

English course identifiers, URLs and stored enum values stay unchanged across languages. User-entered names, questions and enquiries are never translated. Japanese examples, software names and spreadsheet formulas retain their original wording where needed for the exercise.
