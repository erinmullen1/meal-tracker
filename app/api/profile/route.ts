import { type NextRequest } from "next/server";
import { getProfile, upsertProfile, getTargets, type ProfileInput } from "@/lib/profile";
import type { ActivityLevel, Sex } from "@/lib/scoring";

export const runtime = "nodejs";

const ACTIVITY_LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
const SEXES: Sex[] = ["male", "female"];

export async function GET() {
  return Response.json({ profile: getProfile(), targets: getTargets() });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const {
    height_cm,
    weight_kg,
    sex,
    age,
    activity_level,
    override_calories,
    override_protein_g,
    override_carbs_g,
    override_fat_g,
    override_fiber_g,
  } = body as Record<string, unknown>;

  if (height_cm !== undefined && height_cm !== null && (typeof height_cm !== "number" || height_cm < 50 || height_cm > 250)) {
    return Response.json({ error: "height_cm must be between 50 and 250" }, { status: 400 });
  }
  if (weight_kg !== undefined && weight_kg !== null && (typeof weight_kg !== "number" || weight_kg < 20 || weight_kg > 300)) {
    return Response.json({ error: "weight_kg must be between 20 and 300" }, { status: 400 });
  }
  if (age !== undefined && age !== null && (typeof age !== "number" || age < 1 || age > 120)) {
    return Response.json({ error: "age must be between 1 and 120" }, { status: 400 });
  }
  if (sex !== undefined && sex !== null && !SEXES.includes(sex as Sex)) {
    return Response.json({ error: "sex must be one of: " + SEXES.join(", ") }, { status: 400 });
  }
  if (activity_level !== undefined && activity_level !== null && !ACTIVITY_LEVELS.includes(activity_level as ActivityLevel)) {
    return Response.json({ error: "activity_level must be one of: " + ACTIVITY_LEVELS.join(", ") }, { status: 400 });
  }
  for (const [key, value] of Object.entries({
    override_calories,
    override_protein_g,
    override_carbs_g,
    override_fat_g,
    override_fiber_g,
  })) {
    if (value !== undefined && value !== null && (typeof value !== "number" || value < 0)) {
      return Response.json({ error: `${key} must be a non-negative number` }, { status: 400 });
    }
  }

  const rawPatch = {
    height_cm,
    weight_kg,
    sex,
    age,
    activity_level,
    override_calories,
    override_protein_g,
    override_carbs_g,
    override_fat_g,
    override_fiber_g,
  };
  const patch: ProfileInput = Object.fromEntries(
    Object.entries(rawPatch).filter(([, value]) => value !== undefined)
  ) as ProfileInput;

  const profile = upsertProfile(patch);
  return Response.json({ profile, targets: getTargets() });
}
