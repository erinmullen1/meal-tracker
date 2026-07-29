"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { DayTotals } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Props = {
  days: DayTotals[];
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyTrends({ days }: Props) {
  const labels = days.map((d) => {
    const date = new Date(d.date + "T00:00:00");
    return DAY_LABELS[date.getDay()];
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Calories",
        data: days.map((d) => Math.round(d.calories)),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        yAxisID: "kcal",
      },
      {
        label: "Protein (g)",
        data: days.map((d) => Math.round(d.protein_g)),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        yAxisID: "grams",
      },
      {
        label: "Fibre (g)",
        data: days.map((d) => Math.round(d.fiber_g)),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.3,
        yAxisID: "grams",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12 } },
    },
    scales: {
      kcal: {
        type: "linear" as const,
        position: "left" as const,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { font: { size: 11 } },
      },
      grams: {
        type: "linear" as const,
        position: "right" as const,
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">7-day trends</h2>
      {days.every((d) => d.mealCount === 0) ? (
        <p className="flex h-48 items-center justify-center text-sm text-zinc-400">
          Log meals over multiple days to see trends
        </p>
      ) : (
        <div className="h-48">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
}
