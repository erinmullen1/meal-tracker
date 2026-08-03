"use client";

import { useCallback, useEffect, useState } from "react";
import MacroChart from "./MacroChart";
import WeeklyTrends from "./WeeklyTrends";
import type { ParsedMeal, ExerciseLog, DayTotals } from "@/lib/types";
import { today, nDaysAgo } from "@/lib/date";
import { sumMeals, groupByDate } from "@/lib/meals";
import { BASE_TARGETS, type Targets } from "@/lib/scoring";

export default function TrendsView() {
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

  const totals = sumMeals(meals);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Trends</h1>
        <p className="mt-1 text-sm text-zinc-400">Today's macros vs. target, and your last 7 days.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <MacroChart totals={totals} exercise={exercise} targets={targets} />
        <WeeklyTrends days={weekDays} />
      </div>
    </div>
  );
}
