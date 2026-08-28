import { getExerciseBonus, type Targets } from "@/lib/scoring";
import type { ExerciseLog } from "@/lib/types";
import { strings } from "@/lib/strings";

type Props = {
  calories: number;
  exercise: ExerciseLog[];
  targets: Targets;
};

export default function CalorieProgress({ calories, exercise, targets }: Props) {
  const intensities = exercise.map((e) => e.intensity).filter(Boolean) as Array<"light" | "moderate" | "intense">;
  const topIntensity = intensities.includes("intense")
    ? "intense"
    : intensities.includes("moderate")
    ? "moderate"
    : intensities.includes("light")
    ? "light"
    : null;

  const bonus = topIntensity ? getExerciseBonus(topIntensity) : { calories: 0, protein_g: 0 };
  const target = targets.calories + bonus.calories;
  const pct = Math.min((calories / target) * 100, 100);

  const barColour =
    pct >= 100
      ? "bg-rose-500"
      : pct >= 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{strings.calorieProgress.heading}</h2>
        {topIntensity && (
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
            {strings.calorieProgress.workoutBonus(bonus.calories, topIntensity)}
          </span>
        )}
      </div>
      <div className="mb-1.5 flex items-end justify-between">
        <span className="text-3xl font-bold text-zinc-900">{Math.round(calories)}</span>
        <span className="text-sm text-zinc-400">{strings.calorieProgress.target(target)}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColour}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-zinc-400">{strings.calorieProgress.remaining(Math.round(target - calories))}</p>
    </div>
  );
}
