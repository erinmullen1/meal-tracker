"use client";

import { useState } from "react";

type Props = {
  onMealAdded: () => void;
};

export default function MealInput({ onMealAdded }: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: value.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setValue("");
      onMealAdded();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Log a meal
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 2 scrambled eggs on sourdough toast with avocado and a latte"
          rows={3}
          disabled={loading}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none disabled:opacity-50"
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="self-end rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analysing…" : "Log meal"}
        </button>
      </form>
    </div>
  );
}
