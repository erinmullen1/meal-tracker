import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "meals.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const { mkdirSync } = require("fs");
  mkdirSync(path.dirname(DB_PATH), { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      calories REAL,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      fiber_g REAL,
      sugar_g REAL,
      saturated_fat_g REAL,
      sodium_mg REAL,
      score REAL,
      score_reason TEXT,
      highlights TEXT,
      concerns TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercise_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      duration_minutes INTEGER,
      intensity TEXT,
      calories_burned INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      height_cm REAL,
      weight_kg REAL,
      sex TEXT CHECK (sex IN ('male','female')),
      age INTEGER,
      activity_level TEXT CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
      override_calories REAL,
      override_protein_g REAL,
      override_carbs_g REAL,
      override_fat_g REAL,
      override_fiber_g REAL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export type Meal = {
  id: number;
  date: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  saturated_fat_g: number | null;
  sodium_mg: number | null;
  score: number | null;
  score_reason: string | null;
  highlights: string | null;
  concerns: string | null;
  created_at: string;
};

export type ExerciseLog = {
  id: number;
  date: string;
  type: string;
  duration_minutes: number | null;
  intensity: "light" | "moderate" | "intense" | null;
  calories_burned: number | null;
  created_at: string;
};

export type ProfileRow = {
  id: 1;
  height_cm: number | null;
  weight_kg: number | null;
  sex: "male" | "female" | null;
  age: number | null;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active" | null;
  override_calories: number | null;
  override_protein_g: number | null;
  override_carbs_g: number | null;
  override_fat_g: number | null;
  override_fiber_g: number | null;
  updated_at: string;
};
