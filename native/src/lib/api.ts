// iOS Simulator can reach the host Mac's localhost directly. Android
// emulators cannot (they need 10.0.2.2 instead) — that's a problem for a
// later increment once we're testing on Android.
export const API_BASE_URL = "http://localhost:3000";

export type Targets = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

export type ProfileResponse = {
  profile: {
    height_cm: number | null;
    weight_kg: number | null;
    sex: "male" | "female" | null;
    age: number | null;
    activity_level: string | null;
  } | null;
  targets: Targets;
};

export async function getProfile(): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/api/profile`);
  if (!res.ok) {
    throw new Error(`GET /api/profile failed: ${res.status}`);
  }
  return res.json();
}

export type Meal = {
  id: number;
  description: string;
  calories: number | null;
  score: number | null;
};

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getMeals(date: string): Promise<Meal[]> {
  const res = await fetch(`${API_BASE_URL}/api/meals?date=${date}`);
  if (!res.ok) {
    throw new Error(`GET /api/meals failed: ${res.status}`);
  }
  return res.json();
}

export async function logMeal(description: string): Promise<Meal> {
  const res = await fetch(`${API_BASE_URL}/api/meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) {
    throw new Error(`POST /api/meals failed: ${res.status}`);
  }
  return res.json();
}

export type ExerciseIntensity = "light" | "moderate" | "intense";

export type ExerciseLog = {
  id: number;
  type: string;
  duration_minutes: number | null;
  intensity: ExerciseIntensity | null;
};

export async function getExercise(date: string): Promise<ExerciseLog[]> {
  const res = await fetch(`${API_BASE_URL}/api/exercise?date=${date}`);
  if (!res.ok) {
    throw new Error(`GET /api/exercise failed: ${res.status}`);
  }
  return res.json();
}

export async function logExercise(input: {
  type: string;
  duration_minutes?: number;
  intensity?: ExerciseIntensity;
}): Promise<ExerciseLog> {
  const res = await fetch(`${API_BASE_URL}/api/exercise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`POST /api/exercise failed: ${res.status}`);
  }
  return res.json();
}

const EXERCISE_BONUSES: Record<ExerciseIntensity, { calories: number; protein_g: number }> = {
  light: { calories: 200, protein_g: 5 },
  moderate: { calories: 400, protein_g: 10 },
  intense: { calories: 600, protein_g: 15 },
};

// Mirrors lib/scoring.ts's getExerciseBonus on the web app — the bonus for
// today's target is based on the single highest-intensity workout logged.
export function getTopExerciseBonus(logs: ExerciseLog[]): { calories: number; protein_g: number } {
  const intensities = logs.map((l) => l.intensity).filter((i): i is ExerciseIntensity => i != null);
  const top: ExerciseIntensity | null = intensities.includes("intense")
    ? "intense"
    : intensities.includes("moderate")
    ? "moderate"
    : intensities.includes("light")
    ? "light"
    : null;
  return top ? EXERCISE_BONUSES[top] : { calories: 0, protein_g: 0 };
}
