export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(date: string): boolean {
  return date === today();
}

export function addDays(date: string, delta: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function nDaysAgo(n: number): string {
  return addDays(today(), -n);
}

export function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
