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

- **`lib/db.ts`** — SQLite singleton (`getDb()`). Schema auto-created on first call. All API routes import this directly — it's safe to call on the server only (better-sqlite3 is synchronous/native).
- **`lib/ai.ts`** — `analyzeMeal(description)` is the only export. Returns `MealAnalysis` typed via Zod.
- **`lib/scoring.ts`** — pure functions for colour thresholds (`ColourLevel`: green/yellow/red), `BASE_TARGETS`, `getExerciseBonus(intensity)`. Used in both API routes and client components.
- **`lib/types.ts`** — `ParsedMeal` (Meal with `highlights`/`concerns` as `string[]` instead of `string | null`) and `DayTotals`.

### API routes

All routes include `export const runtime = "nodejs"` — required because better-sqlite3 is a native module and won't run on the Edge runtime.

- `GET /api/meals?date=YYYY-MM-DD` or `?from=...&to=...` (date range)
- `POST /api/meals` — triggers AI analysis, stores result
- `PUT /api/meals/[id]` — re-analyses with new description
- `DELETE /api/meals/[id]`
- `GET/POST /api/exercise`
- `POST /api/analyze` — analysis only, no DB write

### Frontend

`app/page.tsx` is a thin wrapper that renders `<Dashboard />`. All data fetching and state live in `components/Dashboard.tsx` (client component). Chart components (`MacroChart`, `WeeklyTrends`) register their own Chart.js modules at the top of the file.

### Telegram bot

`telegram/bot.ts` runs as a standalone process (`pnpm bot`). It imports `lib/db.ts`, `lib/ai.ts`, and `lib/scoring.ts` directly — it shares the same SQLite file as the web app. Requires `TELEGRAM_BOT_TOKEN` in `.env.local`.

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
