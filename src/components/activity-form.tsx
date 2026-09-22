"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ActivityType,
  ACTIVITY_LABELS,
  ACTIVITY_UNITS,
  ACTIVITY_ICONS,
} from "@/lib/types";
import { fetchGridIntensity } from "@/lib/grid-intensity";
import { addActivity } from "@/lib/storage";

const CO2_FACTORS: Record<ActivityType, number> = {
  car: 0.20,
  bus: 0.08,
  flight: 0.25,
  electricity: 0.80,
  veg_meal: 0.5,
  non_veg_meal: 2.0,
};

// Absurd thresholds per activity type — values above these get a warning
const ABSURD_THRESHOLDS: Record<ActivityType, number> = {
  car: 500,        // 500 km car trip is unusual
  bus: 200,        // 200 km bus trip is unusual
  flight: 10000,   // 10,000 km flight is very long
  electricity: 500, // 500 kWh is a lot for one entry
  veg_meal: 20,    // 20 veg meals in one entry is unusual
  non_veg_meal: 20, // 20 non-veg meals in one entry is unusual
};

const PRESETS: Record<ActivityType, { label: string; value: number }[]> = {
  car: [
    { label: "Commute 10 km", value: 10 },
    { label: "Long trip 100 km", value: 100 },
    { label: "City drive 5 km", value: 5 },
  ],
  bus: [
    { label: "Commute 5 km", value: 5 },
    { label: "Cross-city 20 km", value: 20 },
    { label: "Intercity 50 km", value: 50 },
  ],
  flight: [
    { label: "Domestic 500 km", value: 500 },
    { label: "International 5000 km", value: 5000 },
    { label: "Short hop 200 km", value: 200 },
  ],
  electricity: [
    { label: "AC 5 kWh", value: 5 },
    { label: "Heater 3 kWh", value: 3 },
    { label: "Laptop 0.5 kWh", value: 0.5 },
  ],
  veg_meal: [
    { label: "1 meal", value: 1 },
    { label: "3 meals (day)", value: 3 },
  ],
  non_veg_meal: [
    { label: "1 meal", value: 1 },
    { label: "3 meals (day)", value: 3 },
  ],
};

interface GridInfo {
  actual: number;
  description: string;
}

export interface ActivityFormProps {
  onActivityAdded?: () => void;
  className?: string;
}

export function ActivityForm({ onActivityAdded, className }: ActivityFormProps = {}) {
  const [type, setType] = useState<ActivityType | null>(null);
  const [qty, setQty] = useState<number>(0);
  const [previewCO2, setPreviewCO2] = useState<number | null>(null);
  const [gridInfo, setGridInfo] = useState<GridInfo | null>(null);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridError, setGridError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate preview when type or qty changes
  useEffect(() => {
    if (type && qty > 0) {
      setPreviewCO2(qty * CO2_FACTORS[type]);
    } else {
      setPreviewCO2(null);
    }
  }, [type, qty]);

  // Fetch grid intensity when electricity activity is selected with qty > 0
  useEffect(() => {
    if (type === "electricity" && qty > 0) {
      setGridLoading(true);
      setGridError(false);
      fetchGridIntensity()
        .then((g) => {
          if (g) setGridInfo({ actual: g.actual, description: g.description });
          else setGridError(true);
        })
        .catch(() => setGridError(true))
        .finally(() => setGridLoading(false));
    } else {
      setGridInfo(null);
      setGridLoading(false);
      setGridError(false);
    }
  }, [type, qty]);

  const handleTypeSelect = (t: ActivityType) => {
    setType(t);
    setQty(0);
    setError(null);
  };

  const handleQtyChange = (raw: string) => {
    const v = parseFloat(raw);
    if (isNaN(v) || v < 0) {
      setError("Enter a positive number");
      return;
    }
    setQty(v);
    setError(null);
  };

  const handlePreset = (v: number) => {
    setQty(v);
    setError(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!type || qty <= 0) {
      setError("Select an activity and enter a quantity");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const co2 = previewCO2 ?? qty * CO2_FACTORS[type];
      await addActivity({
        id: crypto.randomUUID(),
        type,
        quantity: qty,
        unit: ACTIVITY_UNITS[type],
        co2Kg: co2,
        label: ACTIVITY_LABELS[type],
        createdAt: Date.now(),
        gridIntensity: type === "electricity" ? gridInfo?.actual ?? null : null,
      });
      setSaved(true);
      setType(null);
      setQty(0);
      setPreviewCO2(null);
      setGridInfo(null);

      // Trigger reactive updates across dashboard and components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("planetpulse:activity_updated"));
      }
      if (onActivityAdded) {
        onActivityAdded();
      }

      setTimeout(() => setSaved(false), 2200);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [type, qty, previewCO2, gridInfo, onActivityAdded]);

  return (
    <Card padding="md" className={`space-y-5 animate-fade-in-up border-primary-500/20 ${className || ""}`}>
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-display font-semibold text-neutral-900 dark:text-white">
            Log Activity
          </h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
            Real CO₂ Factors
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-dark-400 mt-0.5">
          Select an activity to calculate emissions
        </p>
      </div>

      {/* Activity type grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Activity type"
      >
        {(
          ["car", "bus", "flight", "electricity", "veg_meal", "non_veg_meal"] as ActivityType[]
        ).map((t) => {
          const selected = type === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleTypeSelect(t)}
              className={`
                group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer text-center
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                ${
                  selected
                    ? "border-primary-500/70 bg-primary-500/15 text-neutral-900 dark:text-white shadow-[0_0_16px_rgba(34,197,94,0.18)]"
                    : "border-neutral-200/70 dark:border-white/[0.06] bg-neutral-50/50 dark:bg-dark-900/60 hover:bg-neutral-100 dark:hover:bg-dark-800/80 hover:border-neutral-300 dark:hover:border-white/[0.12] text-neutral-700 dark:text-dark-300"
                }
              `}
            >
              <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">
                {ACTIVITY_ICONS[t]}
              </span>
              <span className="text-xs font-semibold line-clamp-1">
                {ACTIVITY_LABELS[t]}
              </span>
              <span className="text-[10px] opacity-70 mt-0.5">
                {ACTIVITY_UNITS[t]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quantity input */}
      {type && (
        <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.08] space-y-3 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="activity-qty"
                className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-dark-200"
              >
                Enter Quantity
              </label>
              <span className="text-xs text-primary-500 dark:text-primary-400 font-medium">
                {CO2_FACTORS[type]} kg CO₂ / {ACTIVITY_UNITS[type]}
              </span>
            </div>
            <div className="relative">
              <input
                id="activity-qty"
                type="number"
                min="0"
                step="0.1"
                value={qty || ""}
                onChange={(e) => handleQtyChange(e.target.value)}
                onBlur={() => {
                  if (qty < 0) setQty(0);
                }}
                className={`
                  w-full h-11 sm:h-12 px-4 rounded-xl border text-base sm:text-lg font-semibold tabular-nums
                  transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                  ${
                    error
                      ? "border-red-500/70 bg-red-500/10 text-red-500"
                      : "border-neutral-200 dark:border-white/[0.12] bg-white dark:bg-dark-900 text-neutral-900 dark:text-white focus:border-primary-500"
                  }
                `}
                placeholder="0"
                disabled={loading}
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-neutral-500 dark:text-dark-400">
                {ACTIVITY_UNITS[type]}
              </span>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Quick presets */}
          <div>
            <div className="text-[11px] text-neutral-500 dark:text-dark-400 uppercase tracking-wider font-semibold mb-1.5">
              Quick presets
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {PRESETS[type].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePreset(p.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                    ${
                      qty === p.value
                        ? "bg-primary-500 text-dark-950 font-semibold shadow-sm"
                        : "bg-neutral-100 dark:bg-dark-900 border border-neutral-200 dark:border-white/[0.08] text-neutral-700 dark:text-dark-300 hover:text-neutral-900 dark:hover:text-white hover:border-primary-500/40"
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Absurd input warning (DP2) */}
          {qty > 0 && qty > (ABSURD_THRESHOLDS[type] || Infinity) && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs sm:text-sm animate-fade-in"
              role="alert"
            >
              <span className="text-base flex-shrink-0">⚠️</span>
              <div>
                <p className="font-semibold">
                  Notice: Very large value for {ACTIVITY_LABELS[type]}
                </p>
                <p className="opacity-90 mt-0.5 text-xs leading-relaxed">
                  {qty} {ACTIVITY_UNITS[type]} is far above typical single entries. If this is intentional, you can still log it as-is.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CO2 preview & Grid Info */}
      {previewCO2 !== null && (
        <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.08] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-dark-300">
              Estimated Emission
            </span>
            <div className="flex items-baseline gap-1 text-primary-500 dark:text-primary-400 font-display font-bold text-xl sm:text-2xl tabular-nums">
              {previewCO2.toFixed(1)}
              <span className="text-xs font-normal text-neutral-500 dark:text-dark-400">
                kg CO₂
              </span>
            </div>
          </div>

          {/* Grid intensity badge for electricity */}
          {type === "electricity" && (
            <div
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border
                ${
                  gridLoading
                    ? "bg-neutral-100 dark:bg-dark-900 border-neutral-200 dark:border-dark-800 text-neutral-500 dark:text-dark-400"
                    : gridError
                    ? "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                }
              `}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
              {gridLoading ? (
                <span>Fetching live UK National Grid carbon intensity...</span>
              ) : gridError ? (
                <span>Live grid data unavailable — using standard 0.80 kg/kWh</span>
              ) : (
                <span>
                  UK Grid Live: {gridInfo?.actual.toFixed(0)} gCO₂/kWh ({gridInfo?.description})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        loading={loading}
        disabled={!type || qty <= 0}
        className="w-full"
        size="lg"
        variant="primary"
      >
        {saved ? "✓ Activity Logged Successfully!" : "Log Activity"}
      </Button>
    </Card>
  );
}
