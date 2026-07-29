import { type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import type { ExerciseLog } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? today();
  const db = getDb();
  const logs = db
    .prepare("SELECT * FROM exercise_logs WHERE date = ? ORDER BY created_at ASC")
    .all(date) as ExerciseLog[];
  return Response.json(logs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, duration_minutes, intensity, calories_burned, date = today() } = body as {
    type: string;
    duration_minutes?: number;
    intensity?: "light" | "moderate" | "intense";
    calories_burned?: number;
    date?: string;
  };

  if (!type?.trim()) {
    return Response.json({ error: "type is required" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO exercise_logs (date, type, duration_minutes, intensity, calories_burned)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(date, type, duration_minutes ?? null, intensity ?? null, calories_burned ?? null);

  const log = db.prepare("SELECT * FROM exercise_logs WHERE id = ?").get(result.lastInsertRowid) as ExerciseLog;
  return Response.json(log, { status: 201 });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
