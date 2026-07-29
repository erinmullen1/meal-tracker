"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import MealInput from "./MealInput";
import MealCard from "./MealCard";
import CalorieProgress from "./CalorieProgress";
import NutrientGrid from "./NutrientGrid";
import MacroChart from "./MacroChart";
import WeeklyTrends from "./WeeklyTrends";
import ExercisePanel from "./ExercisePanel";
import type { ParsedMeal, ExerciseLog, DayTotals } from "@/lib/types";
import { BASE_TARGETS, type Targets } from "@/lib/scoring";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function sumMeals(meals: ParsedMeal[]) {
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

function groupByDate(meals: ParsedMeal[]): DayTotals[] {
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

export default function Dashboard() {
  const [meals, setMeals] = useState<ParsedMeal[]>([]);
  const [exercise, setExercise] = useState<ExerciseLog[]>([]);
  const [weekDays, setWeekDays] = useState<DayTotals[]>([]);
  const [targets, setTargets] = useState<Targets>(BASE_TARGETS);

  const fetchToday = useCallback(async () => {
    const t = today();
    const [mealsRes, exerciseRes] = await Promise.all([
      fetch(`/api/meals?date=${t}`),
      fetch(`/api/exercise?date=${t}`),
    ]);
    setMeals(await mealsRes.json());
    setExercise(await exerciseRes.json());
  }, []);

  const fetchWeek = useCallback(async () => {
    const from = nDaysAgo(6);
    const t = today();
    const res = await fetch(`/api/meals?from=${from}&to=${t}`);
    const allMeals: ParsedMeal[] = await res.json();
    setWeekDays(groupByDate(allMeals));
  }, []);

  const fetchTargets = useCallback(async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setTargets(data.targets);
  }, []);

  useEffect(() => {
    fetchToday();
    fetchWeek();
    fetchTargets();
  }, [fetchToday, fetchWeek, fetchTargets]);

  function handleMealAdded() {
    fetchToday();
    fetchWeek();
  }

  function handleMealDeleted(id: number) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    fetchWeek();
  }

  function handleExerciseLogged() {
    fetchToday();
  }

  const totals = sumMeals(meals);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Meal Tracker</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <Link href="/profile" className="text-xs text-zinc-400 hover:text-zinc-600">
            ⚙️ About me
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <MealInput onMealAdded={handleMealAdded} />
          <ExercisePanel logs={exercise} onLogged={handleExerciseLogged} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CalorieProgress calories={totals.calories} exercise={exercise} targets={targets} />
          <NutrientGrid totals={totals} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MacroChart totals={totals} exercise={exercise} targets={targets} />
          <WeeklyTrends days={weekDays} />
        </div>

        {meals.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Today&apos;s meals
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
            <p className="text-sm">Log your first meal above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
