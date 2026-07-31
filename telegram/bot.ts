import { Bot } from "grammy";
import { config } from "dotenv";
import path from "path";

// Load .env.local from project root
config({ path: path.join(process.cwd(), ".env.local") });

import { getDb } from "../lib/db";
import { analyzeMeal } from "../lib/ai";
import { getMealNutrientScores, scoreColourEmoji, scoreMeal, getExerciseBonus } from "../lib/scoring";
import { getTargets } from "../lib/profile";
import type { ExerciseLog, Meal } from "../lib/db";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set in .env.local");
  process.exit(1);
}

const bot = new Bot(token);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

function parseMealRow(meal: Meal) {
  return {
    ...meal,
    highlights: meal.highlights ? JSON.parse(meal.highlights) : [],
    concerns: meal.concerns ? JSON.parse(meal.concerns) : [],
  };
}

function formatNutrients(meal: ReturnType<typeof parseMealRow>): string {
  const scores = getMealNutrientScores(meal);
  return scores
    .map((s) => `${scoreColourEmoji(s.colour)} ${s.label}: ${s.displayValue}`)
    .join("\n");
}

function getDayTotals(date: string) {
  const db = getDb();
  const meals = db.prepare("SELECT * FROM meals WHERE date = ?").all(date) as Meal[];
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein_g: acc.protein_g + (m.protein_g ?? 0),
      fiber_g: acc.fiber_g + (m.fiber_g ?? 0),
      carbs_g: acc.carbs_g + (m.carbs_g ?? 0),
      fat_g: acc.fat_g + (m.fat_g ?? 0),
      mealCount: acc.mealCount + 1,
    }),
    { calories: 0, protein_g: 0, fiber_g: 0, carbs_g: 0, fat_g: 0, mealCount: 0 }
  );
}

function getTopIntensity(date: string): "light" | "moderate" | "intense" | null {
  const db = getDb();
  const logs = db.prepare("SELECT intensity FROM exercise_logs WHERE date = ?").all(date) as Pick<ExerciseLog, "intensity">[];
  const intensities = logs.map((l) => l.intensity).filter(Boolean) as Array<"light" | "moderate" | "intense">;
  if (intensities.includes("intense")) return "intense";
  if (intensities.includes("moderate")) return "moderate";
  if (intensities.includes("light")) return "light";
  return null;
}

// /log <meal description>
bot.command("log", async (ctx) => {
  const description = ctx.match?.trim();
  if (!description) {
    return ctx.reply("Usage: /log <what you ate>\n\nExample: /log bowl of oats with banana and almond milk");
  }

  await ctx.reply("🤔 Analysing your meal…");

  try {
    const analysis = await analyzeMeal(description);
    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO meals (date, description, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, sodium_mg, score, score_reason, highlights, concerns)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        today(),
        description,
        analysis.nutrition.calories,
        analysis.nutrition.protein_g,
        analysis.nutrition.carbs_g,
        analysis.nutrition.fat_g,
        analysis.nutrition.fiber_g,
        analysis.nutrition.sugar_g,
        analysis.nutrition.saturated_fat_g,
        analysis.nutrition.sodium_mg,
        analysis.score,
        analysis.score_reason,
        JSON.stringify(analysis.highlights),
        JSON.stringify(analysis.concerns)
      );

    const meal = db.prepare("SELECT * FROM meals WHERE id = ?").get(result.lastInsertRowid) as Meal;
    const parsed = parseMealRow(meal);
    const scoreEmoji = scoreColourEmoji(scoreMeal(analysis.score));

    let reply = `${scoreEmoji} *${description}*\n`;
    reply += `Score: *${analysis.score.toFixed(1)}/10*\n\n`;
    reply += formatNutrients(parsed) + "\n\n";
    reply += `_${analysis.score_reason}_\n\n`;

    if (analysis.highlights.length > 0) {
      reply += "✅ " + analysis.highlights.join("\n✅ ") + "\n";
    }
    if (analysis.concerns.length > 0) {
      reply += "\n⚠️ " + analysis.concerns.join("\n⚠️ ");
    }

    await ctx.reply(reply, { parse_mode: "Markdown" });
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Failed to analyse meal. Please try again.");
  }
});

// /exercise <type> <duration> <intensity>
// e.g. /exercise run 45 moderate
bot.command("exercise", async (ctx) => {
  const parts = ctx.match?.trim().split(/\s+/) ?? [];
  if (parts.length < 1 || !parts[0]) {
    return ctx.reply(
      "Usage: /exercise <type> [duration] [intensity]\n\nExample: /exercise run 45 moderate\nIntensity: light | moderate | intense"
    );
  }

  const type = parts[0];
  const duration = parts[1] ? parseInt(parts[1]) : undefined;
  const intensity = (["light", "moderate", "intense"].includes(parts[2]) ? parts[2] : "moderate") as "light" | "moderate" | "intense";

  const db = getDb();
  db.prepare(
    `INSERT INTO exercise_logs (date, type, duration_minutes, intensity) VALUES (?, ?, ?, ?)`
  ).run(today(), type, duration ?? null, intensity);

  const targets = getTargets();
  const bonus = getExerciseBonus(intensity);
  let reply = `🏃 Logged: *${type}*`;
  if (duration) reply += ` (${duration} min)`;
  reply += ` — ${intensity}\n\n`;
  reply += `📈 Targets adjusted:\n`;
  reply += `Calories: ${targets.calories} → *${targets.calories + bonus.calories} kcal*\n`;
  reply += `Protein: ${targets.protein_g} → *${targets.protein_g + bonus.protein_g}g*`;

  await ctx.reply(reply, { parse_mode: "Markdown" });
});

// /today
bot.command("today", async (ctx) => {
  const t = today();
  const totals = getDayTotals(t);
  const topIntensity = getTopIntensity(t);
  const bonus = topIntensity ? getExerciseBonus(topIntensity) : { calories: 0, protein_g: 0 };
  const targets = getTargets();
  const calorieTarget = targets.calories + bonus.calories;
  const proteinTarget = targets.protein_g + bonus.protein_g;

  if (totals.mealCount === 0) {
    return ctx.reply(`📋 *${todayLabel()}*\n\nNo meals logged yet. Use /log to add one.`, { parse_mode: "Markdown" });
  }

  const calorieBar = buildBar(totals.calories, calorieTarget);
  let reply = `📋 *${todayLabel()}*\n\n`;
  reply += `🔥 Calories: ${Math.round(totals.calories)} / ${calorieTarget} kcal ${calorieBar}\n`;
  reply += `💪 Protein: ${Math.round(totals.protein_g)}g / ${proteinTarget}g\n`;
  reply += `🌿 Fibre: ${Math.round(totals.fiber_g)}g / ${targets.fiber_g}g\n`;
  reply += `🍞 Carbs: ${Math.round(totals.carbs_g)}g\n`;
  reply += `🧈 Fat: ${Math.round(totals.fat_g)}g\n`;
  reply += `\n${totals.mealCount} meal${totals.mealCount !== 1 ? "s" : ""} logged`;

  if (topIntensity) {
    reply += `\n🏃 ${topIntensity.charAt(0).toUpperCase() + topIntensity.slice(1)} workout — targets boosted`;
  }

  await ctx.reply(reply, { parse_mode: "Markdown" });
});

// /week
bot.command("week", async (ctx) => {
  const db = getDb();
  const rows: { date: string; calories: number; protein_g: number; fiber_g: number; meals: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" });
    const meals = db.prepare("SELECT * FROM meals WHERE date = ?").all(dateStr) as Meal[];
    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories ?? 0),
        protein_g: acc.protein_g + (m.protein_g ?? 0),
        fiber_g: acc.fiber_g + (m.fiber_g ?? 0),
      }),
      { calories: 0, protein_g: 0, fiber_g: 0 }
    );
    rows.push({ date: dayLabel, ...totals, meals: meals.length });
  }

  let reply = `📊 *7-day summary*\n\n`;
  for (const r of rows) {
    if (r.meals === 0) {
      reply += `${r.date}: —\n`;
    } else {
      reply += `${r.date}: ${Math.round(r.calories)} kcal · ${Math.round(r.protein_g)}g protein · ${Math.round(r.fiber_g)}g fibre\n`;
    }
  }

  await ctx.reply(reply, { parse_mode: "Markdown" });
});

bot.command("start", (ctx) =>
  ctx.reply(
    "👋 Welcome to your Meal Tracker!\n\n" +
      "Commands:\n" +
      "/log <what you ate> — analyse a meal\n" +
      "/exercise <type> [mins] [intensity] — log exercise\n" +
      "/today — today's nutrition summary\n" +
      "/week — 7-day overview"
  )
);

function buildBar(current: number, target: number): string {
  const pct = Math.min(current / target, 1);
  const filled = Math.round(pct * 8);
  return "▓".repeat(filled) + "░".repeat(8 - filled);
}

bot.start();
console.log("🤖 Meal Tracker bot is running");
