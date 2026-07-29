"use client";

import { useState } from "react";
import type { ExerciseLog } from "@/lib/types";

type Props = {
  logs: ExerciseLog[];
  onLogged: () => void;
};

const INTENSITIES = ["light", "moderate", "intense"] as const;

export default function ExercisePanel({ logs, onLogged }: Props) {
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<"light" | "moderate" | "intense">("moderate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type.trim(),
          duration_minutes: duration ? parseInt(duration) : undefined,
          intensity,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setType("");
      setDuration("");
      setIntensity("moderate");
      onLogged();
    } catch {
      setError("Failed to log exercise.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Log exercise</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Activity (e.g. run, gym, yoga)"
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none disabled:opacity-50"
          />
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="mins"
            type="number"
            min={1}
            disabled={loading}
            className="w-20 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="flex gap-2">
          {INTENSITIES.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setIntensity(lvl)}
              className={`flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-colors ${
                intensity === lvl
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || !type.trim()}
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Logging…" : "Log exercise"}
        </button>
      </form>

      {logs.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize text-zinc-700">{log.type}</span>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {log.duration_minutes && <span>{log.duration_minutes} min</span>}
                {log.intensity && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      log.intensity === "intense"
                        ? "bg-rose-50 text-rose-700"
                        : log.intensity === "moderate"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {log.intensity}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
