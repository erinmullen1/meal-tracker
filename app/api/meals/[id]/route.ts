import { type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { analyzeMeal } from "@/lib/ai";
import type { Meal } from "@/lib/db";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { description } = body as { description: string };

  if (!description?.trim()) {
    return Response.json({ error: "description is required" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM meals WHERE id = ?").get(id) as Meal | undefined;
  if (!existing) {
    return Response.json({ error: "meal not found" }, { status: 404 });
  }

  const analysis = await analyzeMeal(description);

  db.prepare(
    `UPDATE meals SET description = ?, calories = ?, protein_g = ?, carbs_g = ?, fat_g = ?,
     fiber_g = ?, sugar_g = ?, saturated_fat_g = ?, sodium_mg = ?, score = ?, score_reason = ?,
     highlights = ?, concerns = ? WHERE id = ?`
  ).run(
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
    JSON.stringify(analysis.concerns),
    id
  );

  const updated = db.prepare("SELECT * FROM meals WHERE id = ?").get(id) as Meal;
  return Response.json({
    ...updated,
    highlights: updated.highlights ? JSON.parse(updated.highlights) : [],
    concerns: updated.concerns ? JSON.parse(updated.concerns) : [],
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM meals WHERE id = ?").get(id);
  if (!existing) {
    return Response.json({ error: "meal not found" }, { status: 404 });
  }
  db.prepare("DELETE FROM meals WHERE id = ?").run(id);
  return new Response(null, { status: 204 });
}
