"use client";

import { useEffect, useState, useCallback } from "react";
import { generateSuggestions, Suggestion, getWelcomeSuggestions } from "@/lib/suggestions";
import {
  Sparkles,
  TrendingDown,
  Badge,
  Lightbulb,
  CheckCircle2,
  Leaf,
  Zap,
  Bus,
  Users,
  Train,
  Link,
  Package,
  RefreshCw,
  TreeDeciduous,
} from "lucide-react";

interface SuggestionsPanelProps {
  className?: string;
  activities?: Array<{ type: string; quantity: number }>;
  weeklyTarget?: number;
  showPersonalized?: boolean;
}

const IMPACT_COLORS: Record<Suggestion["impact"], string> = {
  "very-high": "text-green-400 bg-green-500/10 border-green-500/20",
  high: "text-green-400 bg-green-500/10 border-green-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-dark-400 bg-dark-700/30 border-dark-600/30",
};

const IMPACT_LABELS: Record<Suggestion["impact"], string> = {
  "very-high": "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const CATEGORY_ICONS: Record<Suggestion["category"], typeof Bus> = {
  transport: Bus,
  energy: Zap,
  diet: Leaf,
  lifestyle: Package,
  offset: TreeDeciduous,
};

const CATEGORY_LABELS: Record<Suggestion["category"], string> = {
  transport: "Transport",
  energy: "Energy",
  diet: "Diet",
  lifestyle: "Lifestyle",
  offset: "Offset",
};

export function SuggestionsPanel({
  className = "",
  activities = [],
  weeklyTarget = 50,
  showPersonalized = true,
}: SuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(() => {
    setLoading(true);
    try {
      let data: Suggestion[];
      if (showPersonalized && activities.length > 0) {
        data = generateSuggestions(activities, weeklyTarget);
      } else {
        data = getWelcomeSuggestions();
      }
      setSuggestions(data);
    } catch {
      setSuggestions(getWelcomeSuggestions());
    } finally {
      setLoading(false);
    }
  }, [activities, weeklyTarget, showPersonalized]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const totalSavings = suggestions.reduce((sum, s) => sum + (s.savings ?? 0), 0);

  return (
    <div className={`rounded-xl border border-dark-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-dark-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-green-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-dark-100">Smart Suggestions</h3>
              <p className="text-xs text-dark-400">
                {showPersonalized && activities.length > 0
                  ? "Personalized for your habits"
                  : "Ideas to start reducing your footprint"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-dark-400">
            <TrendingDown size={12} className="text-green-400" />
            <span className="font-medium text-green-400">
              {totalSavings.toFixed(1)} kg CO₂/wk
            </span>
            <span className="text-dark-500">potential</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-dark-800/50">
        {loading && (
          <div className="p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-dark-400">Analyzing your habits...</p>
          </div>
        )}

        {suggestions.map((s, index) => {
          const Icon = CATEGORY_ICONS[s.category] || Lightbulb;
          const hasSavings = s.savings !== undefined;

          return (
            <div
              key={s.id}
              className="p-4 hover:bg-dark-800/30 transition-colors group"
              style={{
                animationDelay: `${index * 60}ms`,
                animation: "fade-in-up 400ms ease both",
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center group-hover:bg-dark-700 transition-colors">
                  <Icon size={18} className="text-dark-300 group-hover:text-green-400 transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {/* Title + badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium text-dark-100 group-hover:text-green-400 transition-colors">
                          {s.title}
                        </h4>
                        {s.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dark-700 text-dark-300 border border-dark-600 whitespace-nowrap">
                            {s.badge}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-dark-400 mt-1.5 leading-relaxed line-clamp-2">
                        {s.description}
                      </p>
                    </div>

                    {/* Impact + savings */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {hasSavings && (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-green-400 font-semibold">
                            -{(s.savings ?? 0).toFixed(1)}
                          </span>
                          <span className="text-dark-500">kg/wk</span>
                        </div>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${IMPACT_COLORS[s.impact]}`}
                      >
                        {IMPACT_LABELS[s.impact]}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-dark-500 capitalize">
                      {CATEGORY_LABELS[s.category]}
                    </span>
                    <div className="flex gap-1">
                      <div className="h-1 flex-1 rounded-full bg-dark-700 max-w-[60px]" />
                      {s.savings !== undefined && (
                        <div
                          className="h-1 rounded-full bg-green-500/50"
                          style={{ width: `${Math.min((s.savings || 0) / 30) * 60, 60}px` }}
                        />
                      )}
                      <div className="h-1 flex-1 rounded-full bg-dark-700 max-w-[60px]" />
                    </div>
                    <span className="text-[10px] text-dark-500">
                      {s.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {suggestions.length === 0 && !loading && (
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={20} className="text-dark-500" />
            </div>
            <p className="text-sm text-dark-400">No suggestions available</p>
            <p className="text-xs text-dark-500 mt-1">Try logging some activities first!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuggestionsPanel;
