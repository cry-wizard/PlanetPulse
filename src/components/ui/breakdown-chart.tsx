import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface BreakdownChartProps {
  data: { type: string; label: string; value: number; color: string }[];
  className?: string;
}

export function BreakdownChart({ data, className }: BreakdownChartProps) {
  const filtered = data.filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const total = filtered.reduce((sum, item) => sum + item.value, 0);

  if (filtered.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-neutral-400 dark:text-dark-500 rounded-xl border border-dashed border-neutral-200 dark:border-dark-800 p-4 text-center">
        <span className="text-2xl mb-1.5 opacity-60">🌱</span>
        <p className="text-xs sm:text-sm">No emissions logged yet for this week.</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ""}`}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
            >
              {filtered.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const val = Number(value);
                const pct = total > 0 ? ((val / total) * 100).toFixed(0) : "0";
                return [`${val.toFixed(1)} kg (${pct}%)`, "CO₂"];
              }}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                color: "#f8fafc",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              itemStyle={{ color: "#4ade80" }}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              iconSize={7}
              formatter={(value) => (
                <span className="text-xs text-neutral-600 dark:text-dark-300 font-medium ml-1">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-lg sm:text-xl font-bold font-display text-dark-900 dark:text-white tabular-nums tracking-tight">
            {total.toFixed(1)}
          </div>
          <div className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-dark-500 tracking-wider">
            kg CO₂
          </div>
        </div>
      </div>
    </div>
  );
}
