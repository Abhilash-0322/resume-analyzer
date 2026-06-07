"use client";

import { getScoreBg, getScoreColor } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
}

export function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className={`font-semibold tabular-nums ${getScoreColor(score)}`}>{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBg(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
