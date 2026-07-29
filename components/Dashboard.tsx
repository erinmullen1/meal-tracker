"use client";

import { useCallback, useEffect, useState } from "react";
import MealInput from "./MealInput";
import MealCard from "./MealCard";
import CalorieProgress from "./CalorieProgress";
import NutrientGrid from "./NutrientGrid";
import ExercisePanel from "./ExercisePanel";
import DateNavigator from "./DateNavigator";
import type { ParsedMeal, ExerciseLog } from "@/lib/types";
import { today, isToday, formatDateLabel } from "@/lib/date";
import { sumMeals } from "@/lib/meals";
import { BASE_TARGETS, type Targets } from "@/lib/scoring";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [meals, setMeals] = useState<ParsedMeal[]>([]);
  const [exercise, setExercise] = useState<ExerciseLog[]>([]);
  const [targets, setTargets] = useState<Targets>(BASE_TARGETS);

  const fetchForDate = useCallback(async (date: string) => {
    const [mealsRes, exerciseRes] = await Promise.all([
      fetch(`/api/meals?date=${date}`),
      fetch(`/api/exercise?date=${date}`),
    ]);
    setMeals(await mealsRes.json());
    setExercise(await exerciseRes.json());
  }, []);

  const fetchTargets = useCallback(async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setTargets(data.targets);
  }, []);

  useEffect(() => {
    fetchForDate(selectedDate);
  }, [selectedDate, fetchForDate]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  function handleMealAdded() {
    fetchForDate(selectedDate);
  }

  function handleMealDeleted(id: number) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  function handleExerciseLogged() {
    fetchForDate(selectedDate);
  }

  function handleExerciseDeleted(id: number) {
    setExercise((prev) => prev.filter((e) => e.id !== id));
  }

  const totals = sumMeals(meals);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Meal Tracker</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />

      <div className="grid gap-4 sm:grid-cols-2">
        <MealInput date={selectedDate} onMealAdded={handleMealAdded} />
        <ExercisePanel
          date={selectedDate}
          logs={exercise}
          onLogged={handleExerciseLogged}
          onDelete={handleExerciseDeleted}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CalorieProgress calories={totals.calories} exercise={exercise} targets={targets} />
        <NutrientGrid totals={totals} />
      </div>

      {meals.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {isToday(selectedDate) ? "Today's meals" : `Meals — ${formatDateLabel(selectedDate)}`}
          </h2>
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleMealDeleted} />
            ))}
          </div>
        </section>
      )}

      {meals.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-center text-zinc-400">
          <span className="text-4xl">🥗</span>
          <p className="text-sm">
            {isToday(selectedDate)
              ? "Log your first meal above to get started."
              : `No meals logged for ${formatDateLabel(selectedDate)}.`}
          </p>
        </div>
      )}
    </div>
  );
}
