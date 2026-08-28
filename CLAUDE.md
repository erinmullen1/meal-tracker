# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start Next.js dev server (localhost:3000)
pnpm build        # production build + type check
pnpm bot          # run Telegram bot (tsx telegram/bot.ts)
```

Type-check without building:
```bash
npx tsc --noEmit --project tsconfig.json
```

After installing packages that include native modules, rebuild them:
```bash
pnpm rebuild better-sqlite3
```

## Architecture

This is a personal nutrition tracking app. Plain-English meal descriptions are sent to Claude AI, which returns structured nutritional data stored in a local SQLite database.

### Data flow for logging a meal

1. `MealInput` (client component) → `POST /api/meals`
2. Route calls `analyzeMeal()` in `lib/ai.ts` — uses Vercel AI SDK (`generateObject` from `ai`, model `claude-opus-4-8` via `@ai-sdk/anthropic`) with a Zod schema to get structured nutrition + score
3. Result inserted into SQLite via `getDb()` from `lib/db.ts`
4. `highlights` and `concerns` are stored as JSON strings in SQLite; they must be `JSON.parse`d when read back

### Key lib files

- **`lib/db.ts`** — SQLite singleton (`getDb()`). Schema auto-created on first call (`meals`, `exercise_logs`, `profile` tables). All API routes import this directly — it's safe to call on the server only (better-sqlite3 is synchronous/native).
- **`lib/ai.ts`** — `analyzeMeal(description)` is the only export. Returns `MealAnalysis` typed via Zod.
- **`lib/scoring.ts`** — pure functions for colour thresholds (`ColourLevel`: green/yellow/red), `BASE_TARGETS` (fallback defaults), `computeTargets(profile)` (Mifflin-St Jeor BMR × activity multiplier, with per-field manual overrides), `getExerciseBonus(intensity)`. Used in both API routes and client components.
- **`lib/profile.ts`** — `getProfile()`/`upsertProfile()`/`getTargets()`. The only place that reads/writes the single-row `profile` table; shared by `app/api/profile/route.ts` and `telegram/bot.ts` (which talks to SQLite directly, never HTTP) so target logic isn't duplicated.
- **`lib/date.ts`** — shared date helpers (`today()`, `isToday()`, `addDays()`, `nDaysAgo()`, `formatDateLabel()`). `addDays` does pure UTC calendar-day arithmetic — do not parse a date string as local time and round-trip through `toISOString()`, that loses a day in timezones ahead of UTC.
- **`lib/meals.ts`** — `sumMeals()` and `groupByDate()`, shared by `Dashboard.tsx` (today's totals) and `TrendsView.tsx` (macro totals + 7-day grouping).
- **`lib/types.ts`** — `ParsedMeal` (Meal with `highlights`/`concerns` as `string[]` instead of `string | null`) and `DayTotals`.

### API routes

All routes include `export const runtime = "nodejs"` — required because better-sqlite3 is a native module and won't run on the Edge runtime.

- `GET /api/meals?date=YYYY-MM-DD` or `?from=...&to=...` (date range)
- `POST /api/meals` — body `{ description, date? }` (defaults to today), triggers AI analysis, stores result
- `PUT /api/meals/[id]` — re-analyses with new description (does not support changing `date`; delete + re-log to correct a wrong date)
- `DELETE /api/meals/[id]`
- `GET /api/exercise?date=...` or `?from=...&to=...`, `POST /api/exercise` (body accepts optional `date`)
- `DELETE /api/exercise/[id]`
- `GET/PUT /api/profile` — `GET` returns `{ profile, targets }`; `PUT` upserts profile fields (partial patch, shallow-merged) and returns the same shape
- `POST /api/analyze` — analysis only, no DB write

### Frontend

The app is a multi-route Next.js App Router site with persistent nav chrome rather than a single scrolling page:

- **`components/NavShell.tsx`** — client component rendered from `app/layout.tsx`, wraps every page. Renders a left sidebar on desktop (`lg:` breakpoint) and a fixed bottom tab bar on mobile, both driven by the same `NAV_ITEMS` list (Today `/`, Trends `/trends`, About me `/profile`). Icons are from `lucide-react`.
- **`/` → `components/Dashboard.tsx`** — the "Today" screen: `DateNavigator` (prev/next day + native `<input type="date">` to jump anywhere) drives a `selectedDate` state that all fetches/logging are scoped to, so past/future days can be viewed and retroactively logged. Renders `MealInput`, `ExercisePanel`, `CalorieProgress`, `NutrientGrid`, and the meals list for `selectedDate`.
- **`/trends` → `components/TrendsView.tsx`** — always shows *today's* data (not date-navigable): `MacroChart` (macros vs. target) and `WeeklyTrends` (trailing 7-day line chart).
- **`/profile` → `components/ProfileForm.tsx`** — About Me form (height/weight/sex/age/activity level) plus per-target manual overrides; targets are computed server-side via `computeTargets()` and re-fetched after each save, never duplicated client-side.

Chart components (`MacroChart`, `WeeklyTrends`) register their own Chart.js modules at the top of the file.

### Telegram bot

`telegram/bot.ts` runs as a standalone process (`pnpm bot`). It imports `lib/db.ts`, `lib/ai.ts`, `lib/scoring.ts`, `lib/profile.ts` (for `getTargets()`), and `lib/date.ts` directly — it shares the same SQLite file as the web app. Requires `TELEGRAM_BOT_TOKEN` in `.env.local`. Meal/exercise logging via the bot is always for "today" — there's no date argument on `/log` or `/exercise`.

### Environment

`.env.local` needs:
```
ANTHROPIC_API_KEY=...
TELEGRAM_BOT_TOKEN=...   # only needed for the bot
```

### Next.js version note

This project runs Next.js 16. Route handler `params` is a **Promise** — always `await params` in dynamic routes:
```ts
export async function GET(req, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

## PR templates

**Title**: prefix with which app(s) changed, then a plain-English summary of what changed.

- `[Web] <summary>` — changes only under `app/`, `components/`, `lib/`, etc. (the Next.js app)
- `[Native] <summary>` — changes only under `native/` (the Expo app)
- `[Web + Native] <summary>` — touches both (rare — e.g. a shared-pattern change mirrored across both apps)
- `[Docs] <summary>` — changes to repo-wide docs/config that aren't app code (e.g. this file, README)

Examples: `[Native] Add exercise logging and calorie progress card`, `[Web] Add About Me profile and calendar navigation`, `[Web + Native] Centralise UI copy into strings files`, `[Docs] Add PR templates to CLAUDE.md`.

**Body**: three headings, kept concise — a newcomer to the project should be able to read this and understand the change without opening the diff.

```markdown
## What changed
- <2-4 bullets, concrete and specific — name the files/areas touched, not vague>

## Why
<1-3 sentences: the problem, request, or motivation driving this>

## Impact
- <1-3 bullets: what this enables/fixes, any user-visible behavior change, any risk/regression surface>
```

Example (filled in):

```markdown
## What changed
- Extracted all hardcoded UI text into lib/strings.ts (web) and native/src/constants/strings.ts (native)
- Updated every component in both apps to read from the strings file instead of inline copy
- Mirrored keys 1:1 between the two files since the apps don't share a bundler/workspace

## Why
UI copy was scattered across ~20 components with no single source of truth, making future wording changes error-prone and slow.

## Impact
- No user-visible behavior change — pure refactor
- Future copy edits now touch one file per app instead of hunting through components
```
