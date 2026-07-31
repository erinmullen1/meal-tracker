"use client";

import { useEffect, useState } from "react";
import type { ProfileRow } from "@/lib/db";
import type { ActivityLevel, Sex, Targets } from "@/lib/scoring";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (little to no exercise)" },
  { value: "light", label: "Lightly active (1-3 days/week)" },
  { value: "moderate", label: "Moderately active (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very_active", label: "Very active (hard exercise daily)" },
];

const TARGET_FIELDS: { key: keyof Targets; overrideKey: keyof ProfileRow; label: string; unit: string }[] = [
  { key: "calories", overrideKey: "override_calories", label: "Calories", unit: "kcal" },
  { key: "protein_g", overrideKey: "override_protein_g", label: "Protein", unit: "g" },
  { key: "carbs_g", overrideKey: "override_carbs_g", label: "Carbs", unit: "g" },
  { key: "fat_g", overrideKey: "override_fat_g", label: "Fat", unit: "g" },
  { key: "fiber_g", overrideKey: "override_fiber_g", label: "Fibre", unit: "g" },
];

type FormState = {
  height_cm: string;
  weight_kg: string;
  sex: Sex | "";
  age: string;
  activity_level: ActivityLevel | "";
  override_calories: string;
  override_protein_g: string;
  override_carbs_g: string;
  override_fat_g: string;
  override_fiber_g: string;
};

const EMPTY_FORM: FormState = {
  height_cm: "",
  weight_kg: "",
  sex: "",
  age: "",
  activity_level: "",
  override_calories: "",
  override_protein_g: "",
  override_carbs_g: "",
  override_fat_g: "",
  override_fiber_g: "",
};

function profileToForm(profile: ProfileRow | null): FormState {
  if (!profile) return EMPTY_FORM;
  return {
    height_cm: profile.height_cm?.toString() ?? "",
    weight_kg: profile.weight_kg?.toString() ?? "",
    sex: profile.sex ?? "",
    age: profile.age?.toString() ?? "",
    activity_level: profile.activity_level ?? "",
    override_calories: profile.override_calories?.toString() ?? "",
    override_protein_g: profile.override_protein_g?.toString() ?? "",
    override_carbs_g: profile.override_carbs_g?.toString() ?? "",
    override_fat_g: profile.override_fat_g?.toString() ?? "",
    override_fiber_g: profile.override_fiber_g?.toString() ?? "",
  };
}

export default function ProfileForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [targets, setTargets] = useState<Targets | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data: { profile: ProfileRow | null; targets: Targets }) => {
        setForm(profileToForm(data.profile));
        setTargets(data.targets);
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        sex: form.sex || null,
        age: form.age ? Number(form.age) : null,
        activity_level: form.activity_level || null,
        override_calories: form.override_calories ? Number(form.override_calories) : null,
        override_protein_g: form.override_protein_g ? Number(form.override_protein_g) : null,
        override_carbs_g: form.override_carbs_g ? Number(form.override_carbs_g) : null,
        override_fat_g: form.override_fat_g ? Number(form.override_fat_g) : null,
        override_fiber_g: form.override_fiber_g ? Number(form.override_fiber_g) : null,
      };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      setForm(profileToForm(data.profile));
      setTargets(data.targets);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Body stats</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Height (cm)
            <input
              type="number"
              min={50}
              max={250}
              value={form.height_cm}
              onChange={(e) => update("height_cm", e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Weight (kg)
            <input
              type="number"
              min={20}
              max={300}
              value={form.weight_kg}
              onChange={(e) => update("weight_kg", e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Sex
            <select
              value={form.sex}
              onChange={(e) => update("sex", e.target.value as Sex)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
            >
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Age
            <input
              type="number"
              min={1}
              max={120}
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600 sm:col-span-2">
            Activity level
            <select
              value={form.activity_level}
              onChange={(e) => update("activity_level", e.target.value as ActivityLevel)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
            >
              <option value="">—</option>
              {ACTIVITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Targets {targets && <span className="normal-case text-zinc-300">(computed from your stats)</span>}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TARGET_FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1 text-sm text-zinc-600">
              {field.label} ({field.unit})
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder={targets ? String(targets[field.key]) : ""}
                  value={form[field.overrideKey as keyof FormState] as string}
                  onChange={(e) => update(field.overrideKey as keyof FormState, e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                />
                {form[field.overrideKey as keyof FormState] && (
                  <button
                    type="button"
                    onClick={() => update(field.overrideKey as keyof FormState, "")}
                    className="text-xs text-zinc-400 hover:text-zinc-600"
                  >
                    Reset
                  </button>
                )}
              </div>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          Leave a field blank to use the computed value. Enter a number to override it.
        </p>
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
