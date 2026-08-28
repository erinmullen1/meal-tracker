"use client";

import { useState } from "react";
import { getMealNutrientScores, scoreMeal, colourClass, colourDot } from "@/lib/scoring";
import type { ParsedMeal } from "@/lib/types";
import { strings } from "@/lib/strings";

type Props = {
  meal: ParsedMeal;
  onDelete: (id: number) => void;
};

export default function MealCard({ meal, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const scores = getMealNutrientScores(meal);
  const overallColour = scoreMeal(meal.score);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
      onDelete(meal.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1 text-sm text-zinc-800">{meal.description}</p>
        <div className="flex items-center gap-2 shrink-0">
          {meal.score != null && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colourClass(overallColour)}`}
            >
              {meal.score.toFixed(1)}/10
            </span>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-zinc-300 hover:text-rose-400 transition-colors disabled:opacity-40"
            aria-label={strings.mealCard.deleteLabel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {scores.map((s) => (
          <span key={s.label} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
            <span className={`h-1.5 w-1.5 rounded-full ${colourDot(s.colour)}`} />
            {s.label}: {s.displayValue}
          </span>
        ))}
      </div>

      {meal.score_reason && (
        <p className="mt-2.5 text-xs text-zinc-500 leading-relaxed">{meal.score_reason}</p>
      )}

      {(meal.highlights.length > 0 || meal.concerns.length > 0) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {meal.highlights.map((h) => (
            <span key={h} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
              + {h}
            </span>
          ))}
          {meal.concerns.map((c) => (
            <span key={c} className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">
              ! {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
