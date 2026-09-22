/**
 * Week helpers — Monday-based week boundaries (local time).
 * DP3: The week starts on Monday at midnight.
 */

/** Get the Monday of the current week at 00:00:00 local time */
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Get the Sunday of the current week at 23:59:59 local time */
export function getWeekEnd(): Date {
  const monday = getWeekStart();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/** Check if a timestamp is within the current week */
export function isInThisWeek(timestamp: number): boolean {
  const start = getWeekStart().getTime();
  const end = getWeekEnd().getTime();
  return timestamp >= start && timestamp <= end;
}

/** Check if a timestamp is within the previous week */
export function isInLastWeek(timestamp: number): boolean {
  const now = new Date();
  const currentMonday = getWeekStart();
  const lastMonday = new Date(currentMonday);
  lastMonday.setDate(currentMonday.getDate() - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);

  return timestamp >= lastMonday.getTime() && timestamp <= lastSunday.getTime();
}

/** Get number of days remaining in the current week (including today) */
export function getDaysRemainingInWeek(): number {
  const now = new Date();
  const end = getWeekEnd();
  const remaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(7, remaining));
}

/** Format a date range as a human-readable string, e.g. "15 Sep — 21 Sep 2026" */
export function formatWeekRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear) {
    return `${start.toLocaleDateString("en-GB", opts)} — ${end.toLocaleDateString("en-GB", opts)} ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString("en-GB", opts)} ${start.getFullYear()} — ${end.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
}

/** Get the current week's date range label */
export function getCurrentWeekLabel(): string {
  const start = getWeekStart();
  const end = getWeekEnd();
  return formatWeekRange(start, end);
}

/** Get the week change timestamp (when the week rolls over) */
export function getWeekChangeMs(): number {
  const end = getWeekEnd();
  return end.getTime() - Date.now();
}

/** Human-readable time until week reset, e.g. "3 days left" or "less than 1 hour" */
export function getWeekTimeRemaining(): string {
  const ms = getWeekChangeMs();
  if (ms <= 0) return "Week just started";

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} left this week`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left this week`;
  if (minutes > 0) return `less than ${minutes} minute${minutes > 1 ? "s" : ""} left`;
  return "less than a minute left";
}
