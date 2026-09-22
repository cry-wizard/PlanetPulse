"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BreakdownChart } from "@/components/ui/breakdown-chart";
import { ActivityForm } from "@/components/activity-form";
import {
  Activity,
  ACTIVITY_LABELS,
  ACTIVITY_ICONS,
  ACTIVITY_COLORS,
} from "@/lib/types";
import { getActivities, getTarget, removeActivity } from "@/lib/storage";
import {
  getWeekStart,
  getWeekEnd,
  getDaysRemainingInWeek,
  getCurrentWeekLabel,
  getWeekTimeRemaining,
} from "@/lib/week";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowRight, Trash2, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

export function WeeklyTrackerSection({ className }: { className?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [target, setTarget] = useState(50);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(() => {
    setActivities(getActivities());
    setTarget(getTarget());
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();

    // Listen for custom activity updates
    const handleUpdate = () => refreshData();
    window.addEventListener("planetpulse:activity_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("planetpulse:activity_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshData]);

  const thisWeek = useMemo(() => {
    const start = getWeekStart().getTime();
    const end = getWeekEnd().getTime();
    return activities.filter((a) => a.createdAt >= start && a.createdAt <= end);
  }, [activities]);

  const totalCO2 = useMemo(
    () => thisWeek.reduce((s, a) => s + a.co2Kg, 0),
    [thisWeek],
  );

  const breakdown = useMemo(() => {
    const map: Record<string, number> = {};
    thisWeek.forEach((a) => {
      map[a.type] = (map[a.type] || 0) + a.co2Kg;
    });
    return Object.entries(map).map(([type, value]) => ({
      type,
      label: ACTIVITY_LABELS[type as keyof typeof ACTIVITY_LABELS] ?? type,
      value,
      color: ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS] ?? "#94a3b8",
    }));
  }, [thisWeek]);

  const pct = target > 0 ? (totalCO2 / target) * 100 : 0;
  const over = totalCO2 > target;
  const remaining = Math.max(0, target - totalCO2);
  const daysLeft = getDaysRemainingInWeek();
  const dailyAvg = daysLeft > 0 ? totalCO2 / (7 - daysLeft + 1) : totalCO2;
  const recent = activities.slice(0, 5);

  const handleDelete = (id: string) => {
    removeActivity(id);
    refreshData();
    window.dispatchEvent(new CustomEvent("planetpulse:activity_updated"));
  };

  if (loading) {
    return (
      <div className="w-full h-72 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Main Grid: Weekly Summary & Breakdown (2 cols) + Logger (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: This Week's Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md" className="border-primary-500/15">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-neutral-200/80 dark:border-white/[0.08]">
              <div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                  This Week's Emissions
                </h3>
                <p className="text-xs text-neutral-500 dark:text-dark-400 mt-0.5">
                  {getCurrentWeekLabel()} · Monday–Sunday
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    over
                      ? "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30"
                      : pct >= 80
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : "bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/30"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {over ? "Over Budget" : pct >= 80 ? "Getting Close" : "On Track"}
                </span>
                <Link
                  href="/settings"
                  className="text-xs text-primary-500 dark:text-primary-400 hover:underline font-medium ml-1"
                >
                  Adjust target
                </Link>
              </div>
            </div>

            {/* Over Target Supportive Nudge Alert (Decision Point 1) */}
            {over && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-xs sm:text-sm">
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-red-300">
                  <span className="font-semibold text-red-200">
                    Weekly target exceeded by {(totalCO2 - target).toFixed(1)} kg CO₂.
                  </span>{" "}
                  Don't worry — tracking is about awareness! Small swaps like opting for a vegetarian meal, public transit, or reducing standby power can quickly bring you back into balance.
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Total CO2 box */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent border border-primary-500/20 relative overflow-hidden">
                <div className="text-xs font-medium text-neutral-500 dark:text-dark-400 mb-1">
                  Total CO₂ Logged
                </div>
                <div className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 dark:text-white tabular-nums tracking-tight">
                  {totalCO2.toFixed(1)}
                  <span className="text-base font-normal text-neutral-500 dark:text-dark-400 ml-1.5">
                    kg
                  </span>
                </div>
                <div className="mt-2 text-xs text-neutral-500 dark:text-dark-400">
                  {thisWeek.length} activity{thisWeek.length !== 1 ? "ies" : "y"} logged this week
                </div>
              </div>

              {/* Target & Pace box */}
              <div className="p-4 sm:p-5 rounded-xl bg-neutral-100/60 dark:bg-dark-900/50 border border-neutral-200/80 dark:border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-500 dark:text-dark-400">
                      Weekly Budget Target
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white tabular-nums">
                      {target} kg CO₂
                    </span>
                  </div>
                  <div className="my-2">
                    <ProgressBar value={totalCO2} max={target} size="sm" />
                  </div>
                </div>
                <div className="text-xs text-neutral-500 dark:text-dark-400 mt-2 flex items-center justify-between">
                  <span>{getWeekTimeRemaining()}</span>
                  <span className="font-medium text-neutral-700 dark:text-dark-300">
                    {pct.toFixed(0)}% used
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics: Remaining & Daily Average */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-dark-900/40 border border-neutral-200/70 dark:border-white/[0.05]">
                <div className="text-xs text-neutral-500 dark:text-dark-400">
                  {over ? "Over target by" : "Remaining Budget"}
                </div>
                <div
                  className={`text-xl sm:text-2xl font-display font-bold mt-1 tabular-nums ${
                    over
                      ? "text-red-500 dark:text-red-400"
                      : "text-neutral-900 dark:text-white"
                  }`}
                >
                  {over ? `+${(totalCO2 - target).toFixed(1)}` : remaining.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-neutral-400">kg</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-dark-900/40 border border-neutral-200/70 dark:border-white/[0.05]">
                <div className="text-xs text-neutral-500 dark:text-dark-400">
                  Daily Average Pace
                </div>
                <div className="text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white mt-1 tabular-nums">
                  {dailyAvg.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-neutral-400">kg/day</span>
                </div>
              </div>
            </div>

            {/* Emissions Breakdown Donut Chart */}
            <div className="pt-5 border-t border-neutral-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs sm:text-sm font-display font-semibold text-neutral-900 dark:text-white">
                  Emissions Breakdown
                </h4>
                <span className="text-xs text-neutral-500 dark:text-dark-400">
                  By Activity Type
                </span>
              </div>
              <BreakdownChart data={breakdown} />
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quick Activity Form */}
        <div className="lg:col-span-1">
          <ActivityForm onActivityAdded={refreshData} />
        </div>
      </div>

      {/* Recent Activities Section */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-display font-semibold text-neutral-900 dark:text-white">
              Recent Activities
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-dark-800 text-neutral-600 dark:text-dark-400 font-medium">
              {activities.length} total
            </span>
          </div>
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary-500 dark:text-primary-400 hover:text-primary-400 font-medium transition-colors"
          >
            View All History
            <ArrowRight size={14} />
          </Link>
        </div>

        {recent.length > 0 ? (
          <div className="divide-y divide-neutral-200/70 dark:divide-white/[0.06]">
            {recent.map((a) => (
              <div
                key={a.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-dark-900 flex items-center justify-center text-xl shrink-0 border border-neutral-200/60 dark:border-white/[0.06]">
                    {ACTIVITY_ICONS[a.type]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {ACTIVITY_LABELS[a.type]} · {a.quantity} {a.unit}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-dark-500">
                      {new Date(a.createdAt).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white tabular-nums">
                      {a.co2Kg.toFixed(1)} kg
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-dark-500">
                      CO₂
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100"
                    title="Delete activity"
                    aria-label={`Delete ${ACTIVITY_LABELS[a.type]} activity`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs sm:text-sm text-neutral-400 dark:text-dark-500">
            No activities logged yet. Use the form above to log your first activity!
          </div>
        )}
      </Card>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-dark-980 text-dark-100">
      <Navbar currentView="hero" />
      <div className="h-16" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WeeklyTrackerSection />
      </main>
    </div>
  );
}
