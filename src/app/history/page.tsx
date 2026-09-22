"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import {
  Activity,
  ACTIVITY_LABELS,
  ACTIVITY_ICONS,
  ACTIVITY_TYPES,
} from "@/lib/types";
import { getActivities, removeActivity } from "@/lib/storage";
import { isInThisWeek, isInLastWeek } from "@/lib/week";
import { Trash2, Calendar, Filter, ArrowLeft, Plus } from "lucide-react";

type DateFilter = "this_week" | "last_week" | "all_time";
type TypeFilter = "all" | Activity["type"];

export default function HistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("this_week");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setActivities(getActivities());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("planetpulse:activity_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("planetpulse:activity_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadData]);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (dateFilter === "this_week" && !isInThisWeek(a.createdAt)) return false;
      if (dateFilter === "last_week" && !isInLastWeek(a.createdAt)) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      return true;
    });
  }, [activities, dateFilter, typeFilter]);

  const filteredTotal = useMemo(
    () => filtered.reduce((s, a) => s + a.co2Kg, 0),
    [filtered],
  );

  const handleDelete = (id: string) => {
    const updated = removeActivity(id);
    setActivities(updated);
    window.dispatchEvent(new CustomEvent("planetpulse:activity_updated"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-980">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-980 text-dark-100">
      <Navbar />
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-dark-400 mb-1">
              <Link href="/" className="hover:text-primary-500 transition-colors flex items-center gap-1">
                <ArrowLeft size={12} />
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-neutral-700 dark:text-dark-200">History</span>
            </div>
            <h1 className="text-display-title text-neutral-900 dark:text-white tracking-tight">
              Activity History
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-dark-400 mt-0.5">
              Review, filter, and manage all your logged carbon activities
            </p>
          </div>

          <Link href="/">
            <Button size="sm" variant="primary" className="self-start sm:self-auto">
              <Plus size={15} />
              Log New Activity
            </Button>
          </Link>
        </div>

        {/* Filter Controls Card */}
        <Card padding="md" className="mb-6 animate-fade-in-up border-primary-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="flex items-center gap-1.5 min-w-[140px]">
                <Calendar size={15} className="text-primary-500 shrink-0" />
                <select
                  id="history-date"
                  aria-label="Filter by date range"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-dark-900 text-xs sm:text-sm font-medium text-neutral-800 dark:text-dark-200 focus:outline-none focus:border-primary-500"
                >
                  <option value="this_week">This week</option>
                  <option value="last_week">Last week</option>
                  <option value="all_time">All time</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5 min-w-[150px]">
                <Filter size={15} className="text-primary-500 shrink-0" />
                <select
                  id="history-type"
                  aria-label="Filter by activity type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-dark-900 text-xs sm:text-sm font-medium text-neutral-800 dark:text-dark-200 focus:outline-none focus:border-primary-500"
                >
                  <option value="all">All activity types</option>
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ACTIVITY_ICONS[t]} {ACTIVITY_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              {(dateFilter !== "this_week" || typeFilter !== "all") && (
                <button
                  onClick={() => {
                    setDateFilter("this_week");
                    setTypeFilter("all");
                  }}
                  className="text-xs text-primary-500 dark:text-primary-400 hover:underline font-medium cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* Total Results Readout */}
            <div className="flex items-baseline gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-200 dark:border-white/[0.08] text-xs text-neutral-500 dark:text-dark-400">
              <span>
                Showing <strong className="text-neutral-900 dark:text-white">{filtered.length}</strong> activity{filtered.length !== 1 ? "ies" : "y"}
              </span>
              <span>·</span>
              <span className="font-display font-semibold text-neutral-900 dark:text-white tabular-nums">
                {filteredTotal.toFixed(1)} kg CO₂
              </span>
            </div>
          </div>
        </Card>

        {/* Activity List */}
        {filtered.length > 0 ? (
          <Card padding="none" className="overflow-hidden animate-fade-in-up">
            <div className="divide-y divide-neutral-200/80 dark:divide-white/[0.06]">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-neutral-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Left: Icon & Label */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-dark-900 flex items-center justify-center text-2xl shrink-0 border border-neutral-200/70 dark:border-white/[0.08] shadow-sm">
                      {ACTIVITY_ICONS[a.type]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        {ACTIVITY_LABELS[a.type]}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-dark-400 mt-0.5">
                        {a.quantity} {a.unit}
                        <span className="mx-1.5 opacity-50">·</span>
                        {new Date(a.createdAt).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: CO2 calculation & Delete Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-display font-bold text-neutral-900 dark:text-white tabular-nums">
                        {a.co2Kg.toFixed(1)}{" "}
                        <span className="text-xs font-normal text-neutral-500 dark:text-dark-400">
                          kg CO₂
                        </span>
                      </div>
                      {a.gridIntensity && (
                        <div className="text-[11px] text-emerald-500">
                          Grid: {a.gridIntensity.toFixed(0)} g/kWh
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      title={`Delete ${ACTIVITY_LABELS[a.type]} entry`}
                      aria-label={`Delete ${ACTIVITY_LABELS[a.type]} entry`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          /* Empty State */
          <Card padding="lg" className="text-center py-12 animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-dark-900 border border-neutral-200 dark:border-white/[0.08] flex items-center justify-center text-3xl mx-auto mb-3">
              📝
            </div>
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white">
              No Activities Found
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-dark-400 mt-1 max-w-sm mx-auto">
              {dateFilter === "all_time"
                ? "You haven't logged any activities yet. Head to the dashboard to start tracking."
                : `No activities recorded for ${dateFilter.replace("_", " ")} with the selected filters.`}
            </p>
            <div className="mt-5">
              <Link href="/">
                <Button variant="primary" size="md">
                  <Plus size={15} />
                  Log an Activity
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
