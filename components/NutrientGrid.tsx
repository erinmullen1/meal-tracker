import { getMealNutrientScores, colourClass } from "@/lib/scoring";
import { strings } from "@/lib/strings";

type Props = {
  totals: {
    calories: number;
    protein_g: number;
    fiber_g: number;
    carbs_g: number;
    fat_g: number;
    sugar_g: number;
    saturated_fat_g: number;
    sodium_mg: number;
  };
};

export default function NutrientGrid({ totals }: Props) {
  const scores = getMealNutrientScores({
    calories: totals.calories,
    protein_g: totals.protein_g,
    fiber_g: totals.fiber_g,
    sugar_g: totals.sugar_g,
    saturated_fat_g: totals.saturated_fat_g,
    sodium_mg: totals.sodium_mg,
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {strings.nutrientGrid.heading}
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {scores.map((s) => (
          <div
            key={s.label}
            className={`flex flex-col items-center rounded-xl border p-3 text-center ${colourClass(s.colour)}`}
          >
            <span className="text-lg font-bold">{s.displayValue}</span>
            <span className="mt-0.5 text-xs font-medium opacity-70">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
