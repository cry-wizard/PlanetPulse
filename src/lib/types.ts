export type ActivityType = "car" | "bus" | "flight" | "electricity" | "veg_meal" | "non_veg_meal";

export const ACTIVITY_TYPES: ActivityType[] = ["car", "bus", "flight", "electricity", "veg_meal", "non_veg_meal"];

export interface Activity {
  id: string;
  type: ActivityType;
  quantity: number;
  unit: "km" | "kWh" | "meals";
  co2Kg: number;
  label: string;
  createdAt: number; // timestamp
  gridIntensity?: number | null; // gCO2/kWh from live API (electricity only)
}

export type DateFilter = "this_week" | "last_week" | "all_time";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  car: "Car travel",
  bus: "Bus travel",
  flight: "Flight",
  electricity: "Electricity",
  veg_meal: "Veg meal",
  non_veg_meal: "Non-veg meal",
};

export const ACTIVITY_UNITS: Record<ActivityType, "km" | "kWh" | "meals"> = {
  car: "km",
  bus: "km",
  flight: "km",
  electricity: "kWh",
  veg_meal: "meals",
  non_veg_meal: "meals",
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  car: "🚗",
  bus: "🚌",
  flight: "✈️",
  electricity: "⚡",
  veg_meal: "🥗",
  non_veg_meal: "🥩",
};

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  car: "#8b5cf6",
  bus: "#3b82f6",
  flight: "#06b6d4",
  electricity: "#f59e0b",
  veg_meal: "#22c55e",
  non_veg_meal: "#ef4444",
};
