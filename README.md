# Meal Tracker

My personal nutrition tracker. I type in what I ate in plain English — "half a baguette with tuna, boiled egg, red onion and avocado" — and Claude analyses it into calories, macros, and a nutrition score, so I don't have to look anything up or weigh food. Everything's stored locally in SQLite; there's no account system, it's just for me.

## What it does

- **Log meals in plain English** and get an AI-scored breakdown (calories, protein, carbs, fat, fibre, sugar, sat fat, sodium) with highlights and concerns
- **Log exercise** and get a calorie/protein bonus added to the day's targets
- **About Me** — my height, weight, sex, age, and activity level drive personalized targets (Mifflin-St Jeor formula), with the option to override any target by hand
- **Calendar navigation** — jump to any past or future day to review or retroactively log something I forgot
- **Trends** — macros vs. target today, plus a 7-day chart
- **A Telegram bot** so I can log meals from my phone without opening the app (`/log`, `/exercise`, `/today`, `/week`)

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Need a `.env.local` in the project root:

```
ANTHROPIC_API_KEY=...
TELEGRAM_BOT_TOKEN=...   # only if you want the Telegram bot too
```

To run the bot alongside the web app (it shares the same local database):

```bash
pnpm bot
```

If `better-sqlite3` ever complains after a fresh install or a Node version change:

```bash
pnpm rebuild better-sqlite3
```

Full architecture notes (data flow, DB schema, API routes) live in [CLAUDE.md](./CLAUDE.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · SQLite (better-sqlite3) · Claude via the Vercel AI SDK · Chart.js · grammY (Telegram)
