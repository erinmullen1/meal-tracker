"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getExerciseBonus, type Targets } from "@/lib/scoring";
import type { ExerciseLog } from "@/lib/types";
import { strings } from "@/lib/strings";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type Props = {
  totals: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
  exercise: ExerciseLog[];
  targets: Targets;
};

export default function MacroChart({ totals, exercise, targets }: Props) {
  const intensities = exercise.map((e) => e.intensity).filter(Boolean) as Array<"light" | "moderate" | "intense">;
  const topIntensity = intensities.includes("intense")
    ? "intense"
    : intensities.includes("moderate")
    ? "moderate"
    : intensities.includes("light")
    ? "light"
    : null;
  const bonus = topIntensity ? getExerciseBonus(topIntensity) : { calories: 0, protein_g: 0 };

  const effectiveTargets = {
    protein_g: targets.protein_g + bonus.protein_g,
    carbs_g: targets.carbs_g,
    fat_g: targets.fat_g,
    fiber_g: targets.fiber_g,
  };

  const labels = [
    strings.macroChart.labels.protein,
    strings.macroChart.labels.carbs,
    strings.macroChart.labels.fat,
    strings.macroChart.labels.fiber,
  ];
  const values = [totals.protein_g, totals.carbs_g, totals.fat_g, totals.fiber_g];
  const targetValues = [effectiveTargets.protein_g, effectiveTargets.carbs_g, effectiveTargets.fat_g, effectiveTargets.fiber_g];

  const backgroundColors = values.map((v, i) => {
    const pct = v / targetValues[i];
    if (pct >= 0.9) return "rgba(16, 185, 129, 0.8)";
    if (pct >= 0.5) return "rgba(245, 158, 11, 0.8)";
    return "rgba(244, 63, 94, 0.8)";
  });

  const data = {
    labels,
    datasets: [
      {
        label: strings.macroChart.consumed,
        data: values,
        backgroundColor: backgroundColors,
        borderRadius: 6,
        maxBarThickness: 40,
      },
      {
        label: strings.macroChart.target,
        data: targetValues,
        backgroundColor: "rgba(0,0,0,0.06)",
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            `${ctx.dataset.label}: ${Math.round(ctx.raw as number)}g`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 12 } } },
    },
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">{strings.macroChart.heading}</h2>
      <div className="h-48">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
