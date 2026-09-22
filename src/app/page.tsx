"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Earth,
  Map,
  Newspaper,
  Lightbulb,
  Thermometer,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Zap,
  Compass,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { WeeklyTrackerSection } from "@/components/dashboard";
import { SplashScreen } from "@/components/splash-screen";
import { getActivities, getTarget } from "@/lib/storage";
import { fetchGridIntensity } from "@/lib/grid-intensity";
import { getWeekStart, getWeekEnd } from "@/lib/week";
import { Activity } from "@/lib/types";

// 3D Globe and Map use browser-only APIs (Three.js, WebGL, window) — load client-side only
const LandingPage3D = dynamic(
  () => import("@/components/globe").then((m) => m.LandingPage3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[#04060d]">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

const WorldMap = dynamic(
  () => import("@/components/map").then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] flex items-center justify-center bg-dark-950/80 rounded-2xl animate-pulse">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

const NewsPanel = dynamic(
  () => import("@/components/news").then((m) => m.NewsPanel),
  { ssr: false }
);

const SuggestionsPanel = dynamic(
  () => import("@/components/suggestions").then((m) => m.SuggestionsPanel),
  { ssr: false }
);

type View = "hero" | "map" | "news" | "suggestions";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<View>("hero");
  const [mapTransitioning, setMapTransitioning] = useState(false);
  const [globeTarget, setGlobeTarget] = useState<[number, number] | null>(null);

  // Live state for quick hero stats
  const [activities, setActivities] = useState<Activity[]>([]);
  const [target, setTarget] = useState(50);
  const [gridIntensity, setGridIntensity] = useState<{ actual: number; description: string } | null>(null);

  const loadData = useCallback(() => {
    setActivities(getActivities());
    setTarget(getTarget());
  }, []);

  useEffect(() => {
    loadData();
    fetchGridIntensity().then((g) => {
      if (g) setGridIntensity({ actual: g.actual, description: g.description });
    });

    const handleUpdate = () => loadData();
    window.addEventListener("planetpulse:activity_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("planetpulse:activity_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadData]);

  const thisWeek = useMemo(() => {
    const start = getWeekStart().getTime();
    const end = getWeekEnd().getTime();
    return activities.filter((a) => a.createdAt >= start && a.createdAt <= end);
  }, [activities]);

  const totalCO2 = useMemo(
    () => thisWeek.reduce((s, a) => s + a.co2Kg, 0),
    [thisWeek]
  );

  const pct = target > 0 ? Math.min(100, (totalCO2 / target) * 100) : 0;

  // Trigger fast spin & zoom into user's location, then open map and disable globe
  const openWorldMap = () => {
    setMapTransitioning(true);

    const proceedWithCoords = (lat: number, lng: number) => {
      setGlobeTarget([lat, lng]);
    };

    if (!navigator.geolocation) {
      proceedWithCoords(28.6, 77.2);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => proceedWithCoords(pos.coords.latitude, pos.coords.longitude),
      () => proceedWithCoords(28.6, 77.2),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 600000 }
    );
  };

  return (
    <div className="relative min-h-screen bg-[#04060d] text-neutral-100 selection:bg-primary-500 selection:text-white font-sans overflow-x-hidden">
      {/* 1. Google Earth Cinematic Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* 2. ONE UNIFIED 3D BACKGROUND EARTH (Enabled when NOT in map view) */}
      {view !== "map" && (
        <div className="fixed inset-0 z-0 pointer-events-auto overflow-hidden">
          <LandingPage3D
            transitionActive={mapTransitioning}
            transitionTarget={globeTarget}
            horizonMode={!mapTransitioning}
            onTransitionComplete={() => {
              // Once globe finishes its high-speed spin and stops on the user's location,
              // transition to World Map and disable/unmount 3D globe!
              setMapTransitioning(false);
              setView("map");
            }}
          />
        </div>
      )}

      {/* 3. Fast Targeting HUD Overlay during World Map transition */}
      {mapTransitioning && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-dark-950/40 backdrop-blur-sm pointer-events-none animate-fade-in">
          <div className="p-6 rounded-2xl bg-dark-950/80 border border-primary-500/40 text-center shadow-2xl max-w-sm mx-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto mb-3" />
            <div className="text-sm font-display font-bold text-white flex items-center justify-center gap-2">
              <Compass size={16} className="text-primary-400 animate-pulse" />
              Pinpointing Your Location on Earth...
            </div>
            {globeTarget && (
              <p className="text-xs text-primary-400 font-mono mt-1.5 tabular-nums">
                Target: {globeTarget[0].toFixed(2)}° N, {globeTarget[1].toFixed(2)}° E
              </p>
            )}
            <p className="text-[11px] text-neutral-400 mt-2">
              Aligning satellite coordinates & loading global carbon map
            </p>
          </div>
        </div>
      )}

      {/* 4. Unified Frosted-Glass Sticky Navigation */}
      <div
        className={`relative z-30 transition-opacity duration-1000 ${
          showSplash ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Navbar
          currentView={view}
          onViewChange={(v) => {
            if (v === "map") openWorldMap();
            else setView(v);
          }}
        />
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      {/* 5. Main Content Layer (Z-10 over rotating space Earth) */}
      <main
        className={`relative z-10 transition-opacity duration-1000 ${
          showSplash ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* ============================================================
            HERO & DASHBOARD VIEW
            ============================================================ */}
        {view === "hero" && (
          <div className="pt-6 sm:pt-10 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Hero Banner with space visibility */}
              <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 text-xs font-semibold mb-3 sm:mb-4 shadow-sm backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  Live Earth Orbit & Carbon Tracker
                </div>
                <h1 className="text-display-hero text-white tracking-tight drop-shadow-md">
                  Track Your{" "}
                  <span className="text-gradient">Carbon Footprint</span>
                </h1>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed drop-shadow">
                  Log your daily commute, energy, and diet against your weekly budget.
                  Watch the Earth rotate in real-time and discover smart reduction strategies.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/history"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-dark-950 font-semibold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary-500/30 active:scale-[0.98]"
                  >
                    View History
                    <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={() => openWorldMap()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-dark-900/80 hover:bg-dark-800 border border-white/[0.15] text-white font-medium rounded-xl text-sm transition-all backdrop-blur-md cursor-pointer hover:border-primary-500/50"
                  >
                    <Compass size={16} className="text-primary-400" />
                    Launch World Map
                  </button>
                </div>
              </div>

              {/* Quick Stat Cards in translucent frosted glass */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8 sm:mb-12">
                {/* Stat 1: Weekly Target */}
                <Card className="p-4 bg-dark-950/70 border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Thermometer size={14} className="text-primary-400" />
                      Weekly Target
                    </span>
                    <span className="text-[11px] font-semibold text-primary-400 tabular-nums">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="my-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                        {totalCO2.toFixed(1)}
                      </span>
                      <span className="text-xs text-neutral-400">
                        / {target} kg
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    className="text-[11px] text-primary-400 hover:underline font-medium"
                  >
                    Edit budget →
                  </Link>
                </Card>

                {/* Stat 2: Live Grid Intensity */}
                <Card className="p-4 bg-dark-950/70 border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Zap size={14} className="text-amber-400" />
                      Live Grid Carbon
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="my-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                        {gridIntensity ? (gridIntensity.actual / 1000).toFixed(2) : "0.21"}
                      </span>
                      <span className="text-xs text-neutral-400">
                        kg CO₂/kWh
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 capitalize">
                      {gridIntensity?.description || "Moderate grid carbon"}
                    </p>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    National Grid API
                  </span>
                </Card>

                {/* Stat 3: News Feed */}
                <Card className="p-4 bg-dark-950/70 border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Newspaper size={14} className="text-blue-400" />
                      Climate Feed
                    </span>
                  </div>
                  <div className="my-2">
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      Global clean energy additions surged 15% as battery storage scaled rapidly.
                    </p>
                  </div>
                  <button
                    onClick={() => setView("news")}
                    className="text-[11px] text-primary-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Read articles <ChevronDown size={11} className="-rotate-90" />
                  </button>
                </Card>

                {/* Stat 4: Logged Activities */}
                <Card className="p-4 bg-dark-950/70 border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Lightbulb size={14} className="text-purple-400" />
                      Logged This Week
                    </span>
                  </div>
                  <div className="my-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                        {thisWeek.length}
                      </span>
                      <span className="text-xs text-neutral-400">
                        activities
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setView("suggestions")}
                    className="text-[11px] text-primary-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Get reduction tips <ChevronDown size={11} className="-rotate-90" />
                  </button>
                </Card>
              </div>

              {/* Real-time Interactive Carbon Tracker Section */}
              <div className="mt-4 sm:mt-8">
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                    Weekly Carbon Tracker
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    Log new entries and inspect your real-time emissions breakdown
                  </p>
                </div>
                <WeeklyTrackerSection />
              </div>

              {/* Why PlanetPulse Feature Grid */}
              <div className="mt-12 sm:mt-16 animate-fade-in-up">
                <div className="text-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                    Why Track with PlanetPulse?
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Everything you need to quantify, understand, and reduce your carbon footprint
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      icon: Earth,
                      title: "Real-Time Calculations",
                      desc: "Log travel, diet, and electricity with scientifically-grounded CO₂ emission factors.",
                      color: "text-primary-400",
                      bg: "bg-primary-500/10",
                      action: () => setView("hero"),
                    },
                    {
                      icon: Thermometer,
                      title: "Weekly Targets",
                      desc: "Set a weekly carbon budget and track progress with supportive, non-blocking nudges.",
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                      action: () => (window.location.href = "/settings"),
                    },
                    {
                      icon: Newspaper,
                      title: "Climate News Feed",
                      desc: "Stay informed with real-time carbon, renewable energy, and climate policy insights.",
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                      action: () => setView("news"),
                    },
                    {
                      icon: Lightbulb,
                      title: "Smart Suggestions",
                      desc: "Get tailored, high-impact recommendations based on your personal logged habits.",
                      color: "text-purple-400",
                      bg: "bg-purple-500/10",
                      action: () => setView("suggestions"),
                    },
                  ].map((f) => (
                    <Card
                      key={f.title}
                      className="p-4 sm:p-5 group cursor-pointer bg-dark-950/70 border-white/[0.08] backdrop-blur-xl hover:border-primary-500/40 transition-all"
                      onClick={f.action}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <f.icon size={20} className={f.color} />
                      </div>
                      <h3 className="text-sm font-display font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {f.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1.5">
                        {f.desc}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            WORLD MAP VIEW (3D Globe Disabled & Unmounted)
            ============================================================ */}
        {view === "map" && (
          <section className="pt-6 sm:pt-8 pb-12" aria-label="World Map">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-display-title text-white tracking-tight">
                    World <span className="text-gradient">Carbon Map</span>
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-2xl">
                    Explore global carbon intensity, see your local region on the map, and compare clean energy grid metrics worldwide.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("hero")}
                  className="self-start sm:self-auto text-xs text-primary-400 font-semibold"
                >
                  ← Back to 3D Globe & Dashboard
                </Button>
              </div>

              {/* Map container */}
              <div className="animate-fade-in-up">
                <Card className="p-0 overflow-hidden border-white/[0.08] bg-dark-950/80">
                  <div className="h-[460px] sm:h-[580px] lg:h-[680px] w-full">
                    <WorldMap className="w-full h-full" />
                  </div>
                  {/* Map footer info */}
                  <div className="border-t border-white/[0.08] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 bg-dark-950/80">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Map size={14} className="text-primary-400" />
                        OpenStreetMap Data
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Earth size={14} className="text-amber-400" />
                        Live UK Grid Carbon API
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setView("hero")}
                      className="text-xs font-semibold text-primary-400"
                    >
                      ← Back to Dashboard
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Location insights cards */}
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
                <InfoCard
                  icon={Earth}
                  title="Your Geolocation"
                  value="Detected via Browser"
                  description="We query your browser's geolocation to highlight your local region and estimate local grid intensity."
                  color="text-primary-400"
                  bg="bg-primary-500/10"
                />
                <InfoCard
                  icon={Zap}
                  title="UK Grid Intensity"
                  value={gridIntensity ? `${(gridIntensity.actual / 1000).toFixed(2)} kg/kWh` : "0.21 kg/kWh"}
                  description="Real-time intensity fluctuates with wind and solar output. Lower numbers represent higher renewable share."
                  color="text-amber-400"
                  bg="bg-amber-500/10"
                />
                <InfoCard
                  icon={Map}
                  title="Global Coverage"
                  value="200+ Countries"
                  description="Carbon intensity metrics are aggregated using open-source climate and electricity datasets worldwide."
                  color="text-blue-400"
                  bg="bg-blue-500/10"
                />
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            CLIMATE NEWS VIEW
            ============================================================ */}
        {view === "news" && (
          <section className="pt-6 sm:pt-8 pb-12" aria-label="Climate News">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-display-title text-white tracking-tight">
                    Climate & Carbon <span className="text-gradient">News Feed</span>
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-2xl">
                    Stay updated with real-time developments across carbon mitigation, renewable technologies,
                    and environmental research.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("hero")}
                  className="self-start sm:self-auto text-xs text-primary-400"
                >
                  ← Back to Dashboard
                </Button>
              </div>

              <div className="animate-fade-in-up">
                <NewsPanel
                  className="max-w-4xl mx-auto"
                  category="all"
                  showCategoryFilter
                  maxArticles={10}
                />
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            SMART SUGGESTIONS VIEW
            ============================================================ */}
        {view === "suggestions" && (
          <section className="pt-6 sm:pt-8 pb-12" aria-label="Smart Suggestions">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-display-title text-white tracking-tight">
                    Smart <span className="text-gradient-amber">Suggestions</span>
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-2xl">
                    Tailored reduction tips designed specifically around your real logged activity patterns.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("hero")}
                  className="self-start sm:self-auto text-xs text-primary-400"
                >
                  ← Back to Dashboard
                </Button>
              </div>

              {/* Two Column Suggestions Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
                {/* Personalized Suggestions Panel */}
                <div>
                  <SuggestionsPanel
                    className="w-full"
                    activities={activities}
                    weeklyTarget={target}
                    showPersonalized={true}
                  />
                </div>

                {/* Practical Reduction Strategies */}
                <Card padding="md" className="space-y-4 bg-dark-950/70 border-white/[0.08] backdrop-blur-xl">
                  <div className="pb-3 border-b border-white/[0.08]">
                    <h3 className="text-base sm:text-lg font-display font-semibold text-white flex items-center gap-2">
                      <Lightbulb size={18} className="text-amber-400" />
                      Quick Everyday Carbon Swaps
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Achieve your weekly target faster with these high-yield habits
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        title: "Switch to LED bulbs",
                        impact: "Save ~1.5 kg CO₂/week",
                        detail: "LEDs use 75% less electricity than incandescent bulbs and last 25x longer.",
                        color: "text-emerald-400",
                      },
                      {
                        title: "Eliminate phantom standby load",
                        impact: "Save ~3 kg CO₂/week",
                        detail: "Smart power strips shut off idling televisions, chargers, and monitors.",
                        color: "text-amber-400",
                      },
                      {
                        title: "Try Meatless Mondays",
                        impact: "Save ~3.5 kg CO₂/week",
                        detail: "A single vegetarian meal reduces meal emissions by 75% compared to meat.",
                        color: "text-purple-400",
                      },
                      {
                        title: "Take transit or carpool",
                        impact: "Save ~5 kg CO₂/week",
                        detail: "Buses produce 60% lower carbon per passenger-km than driving solo.",
                        color: "text-blue-400",
                      },
                      {
                        title: "Opt for cold laundry cycles",
                        impact: "Save ~2 kg CO₂/week",
                        detail: "90% of a washing machine's electricity goes into heating the water.",
                        color: "text-emerald-400",
                      },
                    ].map((tip) => (
                      <div
                        key={tip.title}
                        className="flex items-start gap-3 p-3 rounded-xl bg-dark-900/60 border border-white/[0.06] hover:border-primary-500/40 transition-all"
                      >
                        <div className="mt-0.5 shrink-0">
                          <CheckCircle2 size={16} className={tip.color} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                              {tip.title}
                            </h4>
                            <span className="text-[11px] font-semibold text-primary-400 shrink-0 tabular-nums">
                              {tip.impact}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                            {tip.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Global Footer */}
      <footer
        className={`relative z-10 border-t border-white/[0.08] mt-16 py-8 bg-dark-950/80 backdrop-blur-xl transition-opacity duration-1000 ${
          showSplash ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <Earth size={13} className="text-dark-950 stroke-[2.5]" />
            </div>
            <span className="font-display font-semibold text-white">
              PlanetPulse
            </span>
            <span>— Track. Quantify. Act.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/history" className="hover:text-white transition-colors">
              History
            </Link>
            <Link href="/settings" className="hover:text-white transition-colors">
              Settings
            </Link>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "instant" });
                setShowSplash(true);
              }}
              className="hover:text-primary-400 transition-colors cursor-pointer"
            >
              Replay Intro
            </button>
            <span className="text-dark-700">|</span>
            <span className="text-neutral-500">
              Zero Auth · Data stored safely in client browser
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-component for Info Cards in Map view
function InfoCard({
  icon: Icon,
  title,
  value,
  description,
  color,
  bg,
}: {
  icon: typeof Earth;
  title: string;
  value: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <Card padding="sm" className="p-4 flex flex-col justify-between bg-dark-950/80 border-white/[0.08]">
      <div>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2.5`}>
          <Icon size={16} className={color} />
        </div>
        <CardTitle className="text-xs sm:text-sm text-white">{title}</CardTitle>
        <p className="text-lg sm:text-xl font-display font-bold text-white mt-1 tabular-nums">
          {value}
        </p>
      </div>
      <CardDescription className="text-xs text-neutral-400 mt-2 leading-relaxed">
        {description}
      </CardDescription>
    </Card>
  );
}