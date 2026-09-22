import { memo } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export const ProgressBar = memo(function ProgressBar({
  value,
  max,
  color,
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = value > max;
  const h = size === "sm" ? "h-2" : "h-2.5 sm:h-3";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-neutral-500 dark:text-dark-400 mb-1.5 tabular-nums">
          <span>0 kg</span>
          <span>
            {over ? (
              <span className="text-red-500 dark:text-red-400 font-semibold">
                {value.toFixed(1)} kg ({(value - max).toFixed(1)} kg over)
              </span>
            ) : (
              <span className="font-medium text-dark-800 dark:text-dark-200">
                {value.toFixed(1)} / {max} kg ({pct.toFixed(0)}%)
              </span>
            )}
          </span>
        </div>
      )}
      <div className={cn("bg-neutral-200 dark:bg-dark-800/80 rounded-full overflow-hidden border border-black/5 dark:border-white/[0.06] p-[1px]", h)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            over
              ? "bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
              : pct >= 80
              ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              : "bg-gradient-to-r from-primary-500 to-primary-600 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          )}
          style={{
            width: `${Math.min(100, pct)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && over && (
        <div className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Over target by {(value - max).toFixed(1)} kg
        </div>
      )}
    </div>
  );
});
