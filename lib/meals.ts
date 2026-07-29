import type { ParsedMeal, DayTotals } from "@/lib/types";

export function sumMeals(meals: ParsedMeal[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein_g: acc.protein_g + (m.protein_g ?? 0),
      carbs_g: acc.carbs_g + (m.carbs_g ?? 0),
      fat_g: acc.fat_g + (m.fat_g ?? 0),
      fiber_g: acc.fiber_g + (m.fiber_g ?? 0),
      sugar_g: acc.sugar_g + (m.sugar_g ?? 0),
      saturated_fat_g: acc.saturated_fat_g + (m.saturated_fat_g ?? 0),
      sodium_mg: acc.sodium_mg + (m.sodium_mg ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, saturated_fat_g: 0, sodium_mg: 0 }
  );
}

export function groupByDate(meals: ParsedMeal[]): DayTotals[] {
  const days: DayTotals[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayMeals = meals.filter((m) => m.date === dateStr);
    const totals = sumMeals(dayMeals);
    days.push({ date: dateStr, ...totals, mealCount: dayMeals.length });
  }
  return days;
}
