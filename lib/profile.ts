import { getDb } from "./db";
import type { ProfileRow } from "./db";
import { computeTargets, type Targets } from "./scoring";

const PROFILE_COLUMNS = [
  "height_cm",
  "weight_kg",
  "sex",
  "age",
  "activity_level",
  "override_calories",
  "override_protein_g",
  "override_carbs_g",
  "override_fat_g",
  "override_fiber_g",
] as const;

export type ProfileInput = Partial<Pick<ProfileRow, (typeof PROFILE_COLUMNS)[number]>>;

export function getProfile(): ProfileRow | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM profile WHERE id = 1").get() as ProfileRow | undefined;
  return row ?? null;
}

export function upsertProfile(patch: ProfileInput): ProfileRow {
  const db = getDb();
  const existing = getProfile();
  const merged: Record<string, unknown> = { ...existing, ...patch };

  const values = PROFILE_COLUMNS.map((col) => merged[col] ?? null);

  db.prepare(
    `INSERT INTO profile (id, ${PROFILE_COLUMNS.join(", ")})
     VALUES (1, ${PROFILE_COLUMNS.map(() => "?").join(", ")})
     ON CONFLICT(id) DO UPDATE SET
       ${PROFILE_COLUMNS.map((col) => `${col} = excluded.${col}`).join(",\n       ")},
       updated_at = datetime('now')`
  ).run(...values);

  return getProfile()!;
}

export function getTargets(): Targets {
  return computeTargets(getProfile());
}
