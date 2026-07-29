import { type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { analyzeMeal } from "@/lib/ai";
import type { Meal } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const db = getDb();

  if (from && to) {
    const meals = db
      .prepare("SELECT * FROM meals WHERE date >= ? AND date <= ? ORDER BY date ASC, created_at ASC")
      .all(from, to) as Meal[];
    return Response.json(meals.map(parseMeal));
  }

  const targetDate = date ?? today();
  const meals = db.prepare("SELECT * FROM meals WHERE date = ? ORDER BY created_at ASC").all(targetDate) as Meal[];
  return Response.json(meals.map(parseMeal));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { description, date = today() } = body as { description: string; date?: string };

  if (!description?.trim()) {
    return Response.json({ error: "description is required" }, { status: 400 });
  }

  const analysis = await analyzeMeal(description);

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO meals (date, description, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, sodium_mg, score, score_reason, highlights, concerns)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      date,
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
  return Response.json(parseMeal(meal), { status: 201 });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseMeal(meal: Meal) {
  return {
    ...meal,
    highlights: meal.highlights ? JSON.parse(meal.highlights) : [],
    concerns: meal.concerns ? JSON.parse(meal.concerns) : [],
  };
}
