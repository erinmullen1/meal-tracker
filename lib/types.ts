import type { Meal, ExerciseLog } from "./db";

export type ParsedMeal = Omit<Meal, "highlights" | "concerns"> & {
  highlights: string[];
  concerns: string[];
};

export type { Meal, ExerciseLog };

export type DayTotals = {
  date: string;
  calories: number;
  protein_g: number;
  fiber_g: number;
  carbs_g: number;
  fat_g: number;
  mealCount: number;
};
