"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { getTarget, setTarget, getStorageStats, clearStorage } from "@/lib/storage";
import { getCurrentWeekLabel } from "@/lib/week";
import { Sliders, Database, AlertOctagon, ArrowLeft, Check, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [target, setTargetState] = useState(50);
  const [stats, setStats] = useState({ activities: 0, target: 50 });
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    const s = getStorageStats();
    const t = getTarget();
    setTargetState(t);
    setStats({ activities: s.activities, target: t });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateTargetValue = (v: number) => {
    if (Number.isFinite(v) && v > 0) {
      setTargetState(v);
      setTarget(v);
      setStats((prev) => ({ ...prev, target: v }));
      setSavedFeedback(true);
      window.dispatchEvent(new CustomEvent("planetpulse:activity_updated"));
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTargetValue(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) {
      updateTargetValue(v);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all logged activities? This action cannot be undone.")) {
      clearStorage();
      window.dispatchEvent(new CustomEvent("planetpulse:activity_updated"));
      loadData();
    }
  };

  const targetPresets = [
    { label: "Strict (30 kg)", value: 30, desc: "Ambitious low-carbon lifestyle" },
    { label: "Default (50 kg)", value: 50, desc: "Standard achievable benchmark" },
    { label: "Moderate (80 kg)", value: 80, desc: "Realistic for regular commuters" },
    { label: "Relaxed (120 kg)", value: 120, desc: "Higher travel or energy footprint" },
  ];

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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-dark-400 mb-1">
            <Link href="/" className="hover:text-primary-500 transition-colors flex items-center gap-1">
              <ArrowLeft size={12} />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-neutral-700 dark:text-dark-200">Settings</span>
          </div>
          <h1 className="text-display-title text-neutral-900 dark:text-white tracking-tight">
            Preferences & Target
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-dark-400 mt-0.5">
            Configure your weekly carbon target and inspect local storage metrics
          </p>
        </div>

        {/* Section 1: Weekly Target */}
        <Card padding="md" className="mb-6 animate-fade-in-up border-primary-500/20">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-white/[0.08] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Sliders size={16} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-display font-semibold text-neutral-900 dark:text-white">
                  Weekly Carbon Budget
                </h2>
                <p className="text-xs text-neutral-500 dark:text-dark-400">
                  Resets automatically every Monday · Current: {getCurrentWeekLabel()}
                </p>
              </div>
            </div>

            {savedFeedback && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-500/15 text-primary-500 dark:text-primary-400 text-xs font-semibold animate-fade-in">
                <Check size={13} />
                Saved
              </span>
            )}
          </div>

          {/* Target Input & Slider */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="weekly-target"
                  className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-dark-300"
                >
                  Weekly Budget Target (kg CO₂ / week)
                </label>
                <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-display font-bold text-primary-500 dark:text-primary-400 tabular-nums">
                  {target}
                  <span className="text-xs font-normal text-neutral-500 dark:text-dark-400">
                    kg
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                id="weekly-target-slider"
                type="range"
                min="10"
                max="200"
                step="5"
                value={target}
                onChange={handleSliderChange}
                className="w-full h-2 bg-neutral-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                aria-label="Weekly carbon target slider"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 dark:text-dark-500 mt-1 tabular-nums">
                <span>10 kg (Aggressive)</span>
                <span>50 kg (Standard)</span>
                <span>200 kg (Extended)</span>
              </div>
            </div>

            {/* Direct Number Input */}
            <div className="relative">
              <input
                id="weekly-target"
                type="number"
                min="1"
                max="1000"
                value={target || ""}
                onChange={handleInputChange}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-dark-900 text-neutral-900 dark:text-white font-semibold text-base focus:outline-none focus:border-primary-500 tabular-nums"
                placeholder="Enter exact target"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">
                kg CO₂ / week
              </span>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[11px] text-neutral-500 dark:text-dark-400 uppercase tracking-wider font-semibold mb-2">
                Recommended Presets
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {targetPresets.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => updateTargetValue(p.value)}
                    className={`
                      p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer
                      ${
                        target === p.value
                          ? "border-primary-500 bg-primary-500/10 text-neutral-900 dark:text-white shadow-sm"
                          : "border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-dark-900/60 hover:bg-neutral-100 dark:hover:bg-dark-800/70 text-neutral-700 dark:text-dark-300"
                      }
                    `}
                  >
                    <div className="text-xs font-semibold">{p.label}</div>
                    <div className="text-[10px] text-neutral-400 dark:text-dark-500 mt-0.5 line-clamp-1">
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-dark-400 leading-relaxed bg-neutral-50 dark:bg-dark-900/40 p-3 rounded-xl border border-neutral-200/70 dark:border-white/[0.05]">
              💡 <strong>Context:</strong> The global average personal footprint is roughly 75–100 kg CO₂/week. Meeting Paris Climate Agreement goals requires a long-term target below 40 kg CO₂/week per person.
            </p>
          </div>
        </Card>

        {/* Section 2: Storage & Privacy Stats */}
        <Card padding="md" className="mb-6 animate-fade-in-up">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-200/80 dark:border-white/[0.08] mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Database size={16} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-semibold text-neutral-900 dark:text-white">
                Client Storage & Privacy
              </h2>
              <p className="text-xs text-neutral-500 dark:text-dark-400">
                PlanetPulse requires zero authentication — your data never leaves your browser
              </p>
            </div>
          </div>

          <div className="divide-y divide-neutral-200/70 dark:divide-white/[0.06] text-xs sm:text-sm">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-neutral-600 dark:text-dark-400">Total activities stored</span>
              <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">
                {stats.activities}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-neutral-600 dark:text-dark-400">Storage mechanism</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                HTML5 LocalStorage (No Cookies)
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-neutral-600 dark:text-dark-400">Active week calculation</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                Monday 00:00 – Sunday 23:59 (ISO-8601)
              </span>
            </div>
          </div>
        </Card>

        {/* Section 3: Danger Zone */}
        <Card padding="md" className="border-red-500/25 animate-fade-in-up">
          <div className="flex items-center gap-2.5 pb-3 border-b border-red-500/20 mb-4">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertOctagon size={16} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-semibold text-neutral-900 dark:text-white">
                Danger Zone
              </h2>
              <p className="text-xs text-neutral-500 dark:text-dark-400">
                Permanently purge all activity history and resets from your browser
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-neutral-600 dark:text-dark-400 max-w-md leading-relaxed">
              Clearing data erases all logged car trips, bus rides, flights, energy usage, and meal records. Your target will reset to 50 kg.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClear}
              className="shrink-0"
            >
              Clear All Data
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
