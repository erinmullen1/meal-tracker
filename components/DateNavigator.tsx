"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatDateLabel, isToday, today } from "@/lib/date";
import { strings } from "@/lib/strings";

type Props = {
  selectedDate: string;
  onChange: (date: string) => void;
};

export default function DateNavigator({ selectedDate, onChange }: Props) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={() => onChange(addDays(selectedDate, -1))}
        aria-label={strings.dateNavigator.previousDay}
        className="rounded-xl px-3 py-1.5 text-zinc-500 hover:bg-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="relative flex-1 text-center">
        <span className="text-sm font-medium text-zinc-700">
          {isToday(selectedDate) ? strings.dateNavigator.today : formatDateLabel(selectedDate)}
        </span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={strings.dateNavigator.jumpToDate}
        />
      </div>

      {!isToday(selectedDate) && (
        <button
          type="button"
          onClick={() => onChange(today())}
          className="rounded-xl bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
        >
          {strings.dateNavigator.today}
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange(addDays(selectedDate, 1))}
        aria-label={strings.dateNavigator.nextDay}
        className="rounded-xl px-3 py-1.5 text-zinc-500 hover:bg-zinc-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
