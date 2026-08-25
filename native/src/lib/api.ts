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
