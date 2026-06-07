"use client";

import { Briefcase, Lightbulb, TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RoleBenchmarkResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface RoleBenchmarkProps {
  benchmark: RoleBenchmarkResult;
}

const STATUS_CONFIG = {
  exceeds: {
    label: "Exceeds Expectations",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 ring-emerald-500/30",
    icon: TrendingUp,
  },
  meets: {
    label: "Meets Expectations",
    color: "text-amber-400",
    bg: "bg-amber-500/15 ring-amber-500/30",
    icon: Minus,
  },
  below: {
    label: "Below Benchmark",
    color: "text-rose-400",
    bg: "bg-rose-500/15 ring-rose-500/30",
    icon: TrendingDown,
  },
};

export function RoleBenchmark({ benchmark }: RoleBenchmarkProps) {
  const status = STATUS_CONFIG[benchmark.overallStatus];
  const StatusIcon = status.icon;

  const chartData = benchmark.dimensionComparisons.map((d) => ({
    name: d.label.split(" ")[0],
    fullLabel: d.label,
    You: d.userScore,
    Benchmark: d.benchmark,
    delta: d.delta,
  }));

  return (
    <div className="card-glow rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="h-5 w-5 text-purple-400" />
            {benchmark.roleName} Benchmark
          </h3>
          <p className="max-w-xl text-sm text-muted leading-relaxed">{benchmark.gapSummary}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
              status.bg,
              status.color
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
          <span className="text-sm text-muted">
            Est. percentile:{" "}
            <span className="font-bold text-purple-400">{benchmark.percentileEstimate}th</span>
          </span>
        </div>
      </div>

      <div className="mb-8">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [`${value}`, name]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullLabel || ""
              }
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="You" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Benchmark" fill="#a855f7" radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {benchmark.dimensionComparisons.map((d) => (
          <div
            key={d.dimension}
            className="rounded-lg border border-border bg-background/50 px-4 py-3"
          >
            <p className="mb-1 text-xs text-muted">{d.label}</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold tabular-nums">{d.userScore}</span>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  d.delta >= 5
                    ? "text-emerald-400"
                    : d.delta >= -5
                      ? "text-amber-400"
                      : "text-rose-400"
                )}
              >
                {d.delta >= 0 ? "+" : ""}
                {d.delta} vs {d.benchmark}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-muted">Role Keywords Found</p>
          <div className="flex flex-wrap gap-2">
            {benchmark.keywordMatch.found.length > 0 ? (
              benchmark.keywordMatch.found.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30"
                >
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted">No expected keywords detected</span>
            )}
          </div>
          {benchmark.keywordMatch.missing.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-sm font-medium text-muted">Missing Keywords</p>
              <div className="flex flex-wrap gap-2">
                {benchmark.keywordMatch.missing.slice(0, 8).map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-400 ring-1 ring-rose-500/30"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted">Role Skills Match</p>
          <div className="flex flex-wrap gap-2">
            {benchmark.skillMatch.found.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-purple-500/15 px-2.5 py-1 text-xs font-medium text-purple-400 ring-1 ring-purple-500/30"
              >
                {skill}
              </span>
            ))}
          </div>
          {benchmark.skillMatch.missing.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-sm font-medium text-muted">Skills to Highlight</p>
              <div className="flex flex-wrap gap-2">
                {benchmark.skillMatch.missing.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-purple-400" />
          Role-Specific Tips
        </p>
        <ul className="space-y-2">
          {benchmark.roleSpecificTips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted leading-relaxed">
              <span className="font-mono text-xs text-purple-400">{String(i + 1).padStart(2, "0")}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
