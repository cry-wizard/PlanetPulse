import { Activity } from "@/lib/types";

const STORAGE_KEY = "planetpulse_activities";
const TARGET_KEY = "planetpulse_target";

const DEFAULT_TARGET = 50; // kg CO₂ per week

export function getActivities(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Activity[];
    // Validate basic shape
    if (!Array.isArray(data)) return [];
    return data.map((a) => ({
      ...a,
      createdAt: a.createdAt ?? Date.now(),
    }));
  } catch {
    return [];
  }
}

export function saveActivities(activities: Activity[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error("[PlanetPulse] Failed to save activities:", e);
  }
}

export function addActivity(activity: Activity): Activity[] {
  const activities = getActivities();
  activities.unshift(activity);
  saveActivities(activities);
  return activities;
}

export function removeActivity(id: string): Activity[] {
  const activities = getActivities().filter((a) => a.id !== id);
  saveActivities(activities);
  return activities;
}

export function updateActivity(id: string, updates: Partial<Activity>): Activity[] {
  const activities = getActivities().map((a) =>
    a.id === id ? { ...a, ...updates } : a
  );
  saveActivities(activities);
  return activities;
}

// Target (weekly CO₂ goal)
export function getTarget(): number {
  if (typeof window === "undefined") return DEFAULT_TARGET;
  try {
    const raw = localStorage.getItem(TARGET_KEY);
    if (!raw) return DEFAULT_TARGET;
    const val = Number(raw);
    return Number.isFinite(val) && val > 0 ? val : DEFAULT_TARGET;
  } catch {
    return DEFAULT_TARGET;
  }
}

export function setTarget(target: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TARGET_KEY, String(target));
}

export function getStorageStats(): { activities: number; target: number } {
  const activities = getActivities();
  return {
    activities: activities.length,
    target: getTarget(),
  };
}

// For testing / reset
export function clearStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TARGET_KEY);
}
