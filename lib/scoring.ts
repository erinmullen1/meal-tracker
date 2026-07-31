export type ColourLevel = "green" | "yellow" | "red";

export type NutrientScore = {
  label: string;
  value: number | null;
  unit: string;
  colour: ColourLevel;
  displayValue: string;
};

function clamp(level: ColourLevel): ColourLevel {
  return level;
}

export function scoreProtein(g: number | null): ColourLevel {
  if (g == null) return "red";
  if (g >= 25) return "green";
  if (g >= 15) return "yellow";
  return "red";
}

export function scoreFiber(g: number | null): ColourLevel {
  if (g == null) return "red";
  if (g >= 4) return "green";
  if (g >= 2) return "yellow";
  return "red";
}

export function scoreSaturatedFat(g: number | null): ColourLevel {
  if (g == null) return "green";
  if (g < 4) return "green";
  if (g < 7) return "yellow";
  return "red";
}

export function scoreSugar(g: number | null): ColourLevel {
  if (g == null) return "green";
  if (g < 10) return "green";
  if (g < 20) return "yellow";
  return "red";
}

export function scoreMeal(score: number | null): ColourLevel {
  if (score == null) return "red";
  if (score >= 8) return "green";
  if (score >= 5) return "yellow";
  return "red";
}

export function getMealNutrientScores(meal: {
  protein_g: number | null;
  fiber_g: number | null;
  saturated_fat_g: number | null;
  sugar_g: number | null;
  calories: number | null;
  sodium_mg: number | null;
}): NutrientScore[] {
  return [
    {
      label: "Protein",
      value: meal.protein_g,
      unit: "g",
      colour: scoreProtein(meal.protein_g),
      displayValue: meal.protein_g != null ? `${Math.round(meal.protein_g)}g` : "—",
    },
    {
      label: "Fibre",
      value: meal.fiber_g,
      unit: "g",
      colour: scoreFiber(meal.fiber_g),
      displayValue: meal.fiber_g != null ? `${Math.round(meal.fiber_g)}g` : "—",
    },
    {
      label: "Sat. Fat",
      value: meal.saturated_fat_g,
      unit: "g",
      colour: scoreSaturatedFat(meal.saturated_fat_g),
      displayValue: meal.saturated_fat_g != null ? `${Math.round(meal.saturated_fat_g)}g` : "—",
    },
    {
      label: "Sugar",
      value: meal.sugar_g,
      unit: "g",
      colour: scoreSugar(meal.sugar_g),
      displayValue: meal.sugar_g != null ? `${Math.round(meal.sugar_g)}g` : "—",
    },
    {
      label: "Calories",
      value: meal.calories,
      unit: "kcal",
      colour: "green" as ColourLevel,
      displayValue: meal.calories != null ? `${Math.round(meal.calories)} kcal` : "—",
    },
    {
      label: "Sodium",
      value: meal.sodium_mg,
      unit: "mg",
      colour: meal.sodium_mg != null && meal.sodium_mg > 1500 ? "red" : meal.sodium_mg != null && meal.sodium_mg > 800 ? "yellow" : "green",
      displayValue: meal.sodium_mg != null ? `${Math.round(meal.sodium_mg)}mg` : "—",
    },
  ];
}

// Daily targets (base, before exercise adjustment)
export const BASE_TARGETS = {
  calories: 2000,
  protein_g: 120,
  fiber_g: 25,
  carbs_g: 250,
  fat_g: 65,
};

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Targets = { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number };

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

type ProfileForTargets = {
  height_cm: number | null;
  weight_kg: number | null;
  sex: Sex | null;
  age: number | null;
  activity_level: ActivityLevel | null;
  override_calories: number | null;
  override_protein_g: number | null;
  override_carbs_g: number | null;
  override_fat_g: number | null;
  override_fiber_g: number | null;
};

export function computeTargets(profile: ProfileForTargets | null): Targets {
  const hasStats =
    !!profile &&
    profile.height_cm != null &&
    profile.weight_kg != null &&
    profile.sex != null &&
    profile.age != null &&
    profile.activity_level != null;

  let computed: Targets;
  if (hasStats && profile) {
    const bmr =
      profile.sex === "male"
        ? 10 * profile.weight_kg! + 6.25 * profile.height_cm! - 5 * profile.age! + 5
        : 10 * profile.weight_kg! + 6.25 * profile.height_cm! - 5 * profile.age! - 161;
    const calories = Math.round(bmr * ACTIVITY_MULTIPLIERS[profile.activity_level!]);
    const protein_g = Math.round(profile.weight_kg! * 1.6);
    const fat_g = Math.round((calories * 0.3) / 9);
    const fiber_g = Math.round((calories / 1000) * 14);
    const carbs_g = Math.max(0, Math.round((calories - protein_g * 4 - fat_g * 9) / 4));
    computed = { calories, protein_g, carbs_g, fat_g, fiber_g };
  } else {
    computed = { ...BASE_TARGETS };
  }

  if (!profile) return computed;
  return {
    calories: profile.override_calories ?? computed.calories,
    protein_g: profile.override_protein_g ?? computed.protein_g,
    carbs_g: profile.override_carbs_g ?? computed.carbs_g,
    fat_g: profile.override_fat_g ?? computed.fat_g,
    fiber_g: profile.override_fiber_g ?? computed.fiber_g,
  };
}

export type ExerciseIntensity = "light" | "moderate" | "intense";

export function getExerciseBonus(intensity: ExerciseIntensity): { calories: number; protein_g: number } {
  const bonuses: Record<ExerciseIntensity, { calories: number; protein_g: number }> = {
    light: { calories: 200, protein_g: 5 },
    moderate: { calories: 400, protein_g: 10 },
    intense: { calories: 600, protein_g: 15 },
  };
  return bonuses[intensity];
}

export function colourClass(level: ColourLevel): string {
  switch (level) {
    case "green": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "yellow": return "bg-amber-100 text-amber-800 border-amber-200";
    case "red": return "bg-rose-100 text-rose-800 border-rose-200";
  }
}

export function colourDot(level: ColourLevel): string {
  switch (level) {
    case "green": return "bg-emerald-500";
    case "yellow": return "bg-amber-500";
    case "red": return "bg-rose-500";
  }
}

export function colourBar(level: ColourLevel): string {
  switch (level) {
    case "green": return "bg-emerald-500";
    case "yellow": return "bg-amber-500";
    case "red": return "bg-rose-500";
  }
}

export function scoreColourEmoji(level: ColourLevel): string {
  switch (level) {
    case "green": return "🟢";
    case "yellow": return "🟡";
    case "red": return "🔴";
  }
}
